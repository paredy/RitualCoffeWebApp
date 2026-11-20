import { BadRequestException, ConflictException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { Model } from 'mongoose';
import { PasswordService } from '../auth/password.service.js';
import type { User } from './schemas/user.schema.js';
import { CreateAdminDto } from './dto/create-admin.dto.js';
import {
  toAuthUser,
  type AuthUserResponseDto,
} from '../auth/dto/auth-user-response.dto.js';

const inputErrors: Record<string, string> = {
  name: 'El nombre debe tener entre 2 y 100 caracteres.',
  username:
    'El username debe tener entre 3 y 30 caracteres: letras sin tildes, números, punto, guion o guion bajo; debe empezar por una letra o número.',
  email: 'El email de contacto debe tener un formato válido.',
  password: 'La contraseña debe tener entre 12 y 128 caracteres.',
};

export async function validateAdminInput(
  input: CreateAdminDto,
): Promise<CreateAdminDto> {
  const data = plainToInstance(CreateAdminDto, input);
  const errors = await validate(data, {
    whitelist: true,
    forbidNonWhitelisted: true,
    validationError: { target: false, value: false },
  });
  if (errors.length)
    throw new BadRequestException([
      ...new Set(
        errors.map(
          (error) =>
            inputErrors[error.property] ?? 'No se admiten campos adicionales.',
        ),
      ),
    ]);
  return data;
}

// CLI-only provisioning. No public registration endpoint and no default credentials.
export async function createInitialAdmin(
  users: Model<User>,
  input: CreateAdminDto,
): Promise<AuthUserResponseDto> {
  const data = await validateAdminInput(input);
  if (await users.exists({ role: 'admin' }))
    throw new ConflictException(
      'Ya existe un administrador; no se modificó ninguna cuenta',
    );
  const passwordHash = await new PasswordService().hash(data.password);
  const user = await users.create({
    name: data.name,
    username: data.username,
    email: data.email,
    passwordHash,
    role: 'admin',
  });
  return toAuthUser(user);
}
