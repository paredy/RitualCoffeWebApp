import mongoose from 'mongoose';
import { SessionSchema } from './session.schema.js';
import { hashSessionToken } from '../auth.service.js';

const Session = mongoose.model('SessionValidationTest', SessionSchema);
const valid = {
  tokenHash: hashSessionToken('test-only-token'),
  userId: new mongoose.Types.ObjectId(),
  expiresAt: new Date(Date.now() + 1000),
};
describe('SessionSchema', () => {
  it('valida referencias y fechas sin exponer el hash de sesión', async () => {
    const session = new Session(valid);
    await expect(session.validate()).resolves.toBeUndefined();
    expect(session.toJSON()).not.toHaveProperty('tokenHash');
    expect(SessionSchema.path('tokenHash').options.select).toBe(false);
    expect(SessionSchema.indexes()).toContainEqual([
      { expiresAt: 1 },
      { expireAfterSeconds: 0 },
    ]);
  });
  it.each(['tokenHash', 'userId', 'expiresAt'])(
    'requiere %s',
    async (field) => {
      await expect(
        new Session({ ...valid, [field]: undefined }).validate(),
      ).rejects.toThrow();
    },
  );
  it.each([
    { tokenHash: 'raw-token' },
    { userId: 'bad-id' },
    { expiresAt: 'invalid' },
  ])('rechaza %j', async (data) => {
    await expect(
      new Session({ ...valid, ...data }).validate(),
    ).rejects.toThrow();
  });
});
