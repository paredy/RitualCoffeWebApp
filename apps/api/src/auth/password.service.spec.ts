import { parseOptions } from '@node-rs/argon2';
import { PasswordService } from './password.service.js';

describe('PasswordService', () => {
  const passwords = new PasswordService();
  beforeAll(async () => {
    await passwords.onModuleInit();
  });

  it('genera Argon2id con salt aleatorio y parámetros acordes a la política', async () => {
    const first = await passwords.hash('Contraseña de prueba 123');
    const second = await passwords.hash('Contraseña de prueba 123');
    expect(first).not.toBe(second);
    expect(first).not.toContain('Contraseña');
    expect(parseOptions(first)).toMatchObject({
      algorithm: 2,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
      outputLen: 32,
    });
    await expect(
      passwords.verify(first, 'Contraseña de prueba 123'),
    ).resolves.toBe(true);
    await expect(passwords.verify(first, 'otra contraseña')).resolves.toBe(
      false,
    );
  });
  it('no recorta ni cambia contraseñas y admite Unicode', async () => {
    const hash = await passwords.hash('  Mi contraseña ñ  ');
    await expect(passwords.verify(hash, '  Mi contraseña ñ  ')).resolves.toBe(
      true,
    );
    await expect(passwords.verify(hash, 'Mi contraseña ñ')).resolves.toBe(
      false,
    );
  });
  it.each([undefined, 'texto-plano', '$argon2id$invalid'])(
    'rechaza hashes ausentes o mal formados',
    async (hash) => {
      await expect(passwords.verify(hash, 'test-password')).resolves.toBe(
        false,
      );
    },
  );
});
