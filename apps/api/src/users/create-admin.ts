import 'reflect-metadata';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createConnection } from 'mongoose';
import { emitKeypressEvents, type Key } from 'node:readline';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import { User, UserSchema } from './schemas/user.schema.js';
import {
  createInitialAdmin,
  validateAdminInput,
} from './create-initial-admin.js';
import { AdminInputError, adminCliErrorMessages } from './admin-cli-errors.js';

function hiddenPassword(label: string): Promise<string> {
  if (!process.stdin.isTTY || !process.stdout.isTTY)
    throw new AdminInputError(
      'Ejecuta este comando en una terminal interactiva.',
    );
  const input = process.stdin;
  const wasRaw = input.isRaw;
  emitKeypressEvents(input);
  input.setRawMode(true);
  input.resume();
  process.stdout.write(label);
  return new Promise((resolve, reject) => {
    let value = '';
    let inputOverflow = false;
    const finish = () => {
      input.removeListener('keypress', onKey);
      input.setRawMode(wasRaw);
      input.pause();
      process.stdout.write('\n');
    };
    const onKey = (text: string, key: Key) => {
      if (key.ctrl && ['c', 'd'].includes(key.name ?? '')) {
        finish();
        reject(new AdminInputError('Operación cancelada.'));
        return;
      }
      if (key.name === 'return' || key.name === 'enter') {
        finish();
        if (inputOverflow)
          reject(
            new AdminInputError(
              'La contraseña debe tener entre 12 y 128 caracteres.',
            ),
          );
        else resolve(value);
        return;
      }
      if (key.name === 'backspace') {
        value = Array.from(value).slice(0, -1).join('');
        return;
      }
      if (
        !key.ctrl &&
        !key.meta &&
        text &&
        Array.from(text).every((character) => {
          const code = character.codePointAt(0)!;
          return code >= 32 && code !== 127;
        })
      ) {
        value += text;
        // Keep raw mode until Enter so the remainder of a long paste cannot echo in the shell.
        if (value.length > 2048) {
          inputOverflow = true;
          value = value.slice(0, 2048);
        }
      }
    };
    input.on('keypress', onKey);
  });
}

async function main(): Promise<void> {
  if (!process.stdin.isTTY || !process.stdout.isTTY)
    throw new AdminInputError('Se necesita una terminal interactiva.');
  const prompt = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  let name: string;
  let username: string;
  let email: string;
  try {
    name = (await prompt.question('Nombre: ')).trim();
    username = (await prompt.question('Username: ')).trim();
    email = (await prompt.question('Email de contacto: ')).trim();
  } finally {
    prompt.close();
  }
  const password = await hiddenPassword(
    'Contraseña (12–128 caracteres, entrada oculta): ',
  );
  // Validate before opening MongoDB or initializing any indexes.
  const data = await validateAdminInput({ name, username, email, password });
  if (password !== (await hiddenPassword('Repite la contraseña: ')))
    throw new AdminInputError('Las contraseñas no coinciden.');
  await ConfigModule.forRoot({
    envFilePath: [
      fileURLToPath(new URL('../../.env', import.meta.url)),
      '.env',
    ],
  });
  const config = new ConfigService();
  const user = encodeURIComponent(config.getOrThrow<string>('MONGO_USER'));
  const secret = encodeURIComponent(
    config.getOrThrow<string>('MONGO_PASSWORD'),
  );
  const database = config.getOrThrow<string>('MONGO_DATABASE');
  const host = config.getOrThrow<string>('MONGO_HOST');
  if (
    config.get<string>('NODE_ENV') === 'production' ||
    !['localhost', '127.0.0.1'].includes(host) ||
    database !== 'ritual_coffee'
  ) {
    throw new AdminInputError(
      'La creación inicial automática solo admite ritual_coffee local en desarrollo',
    );
  }
  const uri = `mongodb://${user}:${secret}@${host}:${config.getOrThrow<string>('MONGO_PORT')}/${database}?authSource=${database}`;
  const connection = createConnection(uri, {
    autoIndex: false,
    autoCreate: false,
    serverSelectionTimeoutMS: 10000,
  });
  try {
    await connection.asPromise();
    const users = connection.model(User.name, UserSchema);
    await users.createCollection();
    await users.createIndexes();
    await createInitialAdmin(users, data);
    console.log('Administrador creado. Puedes iniciar sesión con su username.');
  } finally {
    await connection.close();
  }
}

try {
  await main();
} catch (error) {
  // Errors from the driver may contain secrets or document values; never dump them.
  console.error('No se creó el administrador.');
  for (const message of adminCliErrorMessages(error)) console.error(message);
  process.exitCode = 1;
}
