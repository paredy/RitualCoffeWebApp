import 'reflect-metadata';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createConnection } from 'mongoose';
import { fileURLToPath } from 'node:url';
import { modelDefinitions } from './model-definitions.js';

async function prepare(): Promise<void> {
  await ConfigModule.forRoot({
    envFilePath: [
      fileURLToPath(new URL('../../.env', import.meta.url)),
      '.env',
    ],
  });
  const config = new ConfigService();
  const host = config.getOrThrow<string>('MONGO_HOST');
  const database = config.getOrThrow<string>('MONGO_DATABASE');
  if (
    !['127.0.0.1', 'localhost'].includes(host) ||
    database !== 'ritual_coffee'
  ) {
    throw new Error(
      'La preparación automática solo admite ritual_coffee en MongoDB local',
    );
  }
  const user = encodeURIComponent(config.getOrThrow<string>('MONGO_USER'));
  const password = encodeURIComponent(
    config.getOrThrow<string>('MONGO_PASSWORD'),
  );
  const port = config.getOrThrow<string>('MONGO_PORT');
  const uri = `mongodb://${user}:${password}@${host}:${port}/${database}?authSource=${database}`;
  const connection = createConnection(uri, {
    autoIndex: false,
    autoCreate: false,
    serverSelectionTimeoutMS: 10000,
  });
  try {
    await connection.asPromise();
    for (const definition of modelDefinitions) {
      const model = connection.model(definition.name, definition.schema);
      await model.createCollection();
      // Add indexes; syncIndexes could drop existing indexes and is intentionally avoided.
      await model.createIndexes();
      const indexes = await model.collection.indexes();
      const count = await model.countDocuments();
      console.log(
        `${model.collection.name}: ${count} documentos; índices: ${indexes.map((index) => index.name).join(', ')}`,
      );
    }
    console.log(
      'Preparación local completada sin insertar, actualizar ni borrar documentos.',
    );
  } finally {
    await connection.close();
  }
}

try {
  await prepare();
} catch (error) {
  // Never print connection strings, credentials or document contents.
  console.error(
    'No se pudo completar la preparación local. Revisa Docker, variables y posibles conflictos de índices.',
  );
  console.error(error instanceof Error ? error.name : 'Error desconocido');
  process.exitCode = 1;
}
