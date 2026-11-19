import 'reflect-metadata';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { LoginDto } from './login.dto.js';

const pipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
});
const meta = { type: 'body' as const, metatype: LoginDto };
describe('LoginDto', () => {
  it('normaliza el username y conserva exactamente la contraseña', async () => {
    await expect(
      pipe.transform(
        { username: ' ERICK_01 ', password: '  contraseña  ' },
        meta,
      ),
    ).resolves.toEqual({ username: 'erick_01', password: '  contraseña  ' });
  });
  it.each([
    {},
    { username: 'erick' },
    { username: 'ab', password: 'test' },
    { username: 'con espacios', password: 'test' },
    { username: 'jóse', password: 'test' },
    { username: { $ne: null }, password: 'test' },
    { username: 'erick', password: '' },
    { username: 'erick', password: 'a'.repeat(129) },
    { username: 'erick', password: ['test'] },
    { username: 'erick', password: 'test', role: 'admin' },
  ])('rechaza %j', async (data) => {
    await expect(pipe.transform(data, meta)).rejects.toThrow(
      BadRequestException,
    );
  });
});
