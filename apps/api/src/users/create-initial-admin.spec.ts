import { BadRequestException, ConflictException } from '@nestjs/common';
import type { Model } from 'mongoose';
import {
  createInitialAdmin,
  validateAdminInput,
} from './create-initial-admin.js';
import { AdminInputError, adminCliErrorMessages } from './admin-cli-errors.js';
import type { User } from './schemas/user.schema.js';

const valid = {
  name: 'Administrador de prueba',
  username: 'admin',
  email: 'admin@example.test',
  password: 'Test-only password 123',
};

describe('Validación y mensajes del administrador local', () => {
  it('normaliza username y email sin cambiar la contraseña', async () => {
    await expect(
      validateAdminInput({
        ...valid,
        username: ' ADMIN ',
        email: ' ADMIN@EXAMPLE.TEST ',
      }),
    ).resolves.toEqual(valid);
  });

  it.each(['short', 'a'.repeat(129)])(
    'explica la longitud inválida sin consultar MongoDB ni exponer la contraseña',
    async (password) => {
      const users = { exists: vi.fn(), create: vi.fn() };
      let caught: unknown;
      try {
        await createInitialAdmin(users as unknown as Model<User>, {
          ...valid,
          password,
        });
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeInstanceOf(BadRequestException);
      expect(adminCliErrorMessages(caught)).toEqual([
        'La contraseña debe tener entre 12 y 128 caracteres.',
      ]);
      expect(JSON.stringify(adminCliErrorMessages(caught))).not.toContain(
        password,
      );
      expect(users.exists).not.toHaveBeenCalled();
      expect(users.create).not.toHaveBeenCalled();
    },
  );

  it.each([
    { name: 'A' },
    { username: 'con espacios' },
    { email: 'sin-formato' },
  ])(
    'identifica otros campos inválidos sin reflejar sus valores: %j',
    async (data) => {
      await expect(
        validateAdminInput({ ...valid, ...data }),
      ).rejects.toBeInstanceOf(BadRequestException);
    },
  );

  it('no imprime mensajes del driver ni credenciales que puedan contener', () => {
    expect(
      adminCliErrorMessages(new Error('mongodb://user:secret@host/db')),
    ).toEqual([
      'Revisa que MongoDB esté encendido y la configuración local sea correcta.',
    ]);
    expect(adminCliErrorMessages(new ConflictException('private'))).toEqual([
      'Ya existe un administrador; no se modificó ninguna cuenta.',
    ]);
    expect(
      adminCliErrorMessages({ code: 11000, keyValue: { password: 'secret' } }),
    ).toEqual([
      'Ya existe una cuenta con ese username o email; no se modificó ninguna cuenta.',
    ]);
    expect(
      adminCliErrorMessages(
        new AdminInputError('Las contraseñas no coinciden.'),
      ),
    ).toEqual(['Las contraseñas no coinciden.']);
  });
});
