import mongoose from 'mongoose';
import { UserSchema } from './user.schema.js';

const User = mongoose.model('UserValidationTest', UserSchema);
const valid = {
  username: ' ANA.BARISTA ',
  name: 'Ana Barista',
  email: ' ANA@EXAMPLE.COM ',
  passwordHash: '$argon2id$test-hash',
  role: 'barista',
};

describe('UserSchema', () => {
  it('normaliza email y aplica valores predeterminados', async () => {
    const user = new User(valid);
    await expect(user.validate()).resolves.toBeUndefined();
    expect(user.email).toBe('ana@example.com');
    expect(user.username).toBe('ana.barista');
    expect(user.isActive).toBe(true);
    expect(user.lastLoginAt).toBeNull();
  });
  it.each(['username', 'name', 'email', 'passwordHash', 'role'])(
    'requiere %s',
    async (field) => {
      await expect(
        new User({ ...valid, [field]: undefined }).validate(),
      ).rejects.toThrow();
    },
  );
  it.each([
    { username: 'ab' },
    { username: 'a'.repeat(31) },
    { username: 'bad user' },
    { username: 'José' },
    { name: 'A' },
    { name: 'a'.repeat(101) },
    { email: 'invalid' },
    { role: 'customer' },
    { lastLoginAt: 'invalid' },
  ])('rechaza %j', async (data) => {
    await expect(new User({ ...valid, ...data }).validate()).rejects.toThrow();
  });
  it('excluye el hash de consultas normales y JSON, incluso al seleccionarlo explícitamente', () => {
    expect(UserSchema.path('passwordHash').options.select).toBe(false);
    expect(JSON.stringify(new User(valid))).not.toContain(valid.passwordHash);
    expect(UserSchema.indexes()).toContainEqual([
      { email: 1 },
      { unique: true },
    ]);
    expect(UserSchema.indexes()).toContainEqual([
      { username: 1 },
      { unique: true },
    ]);
  });
});
