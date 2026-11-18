import mongoose from 'mongoose';
import { AuditLogSchema } from './audit-log.schema.js';

const AuditLog = mongoose.model('AuditLogValidationTest', AuditLogSchema);
const valid = { action: 'product.price_updated', entityType: 'Product' };

describe('AuditLogSchema', () => {
  it('acepta un actor opcional y objetos de cambios', async () => {
    const log = new AuditLog({
      ...valid,
      changes: { price: { before: '3.50', after: '4.00' } },
      metadata: { source: 'barista' },
    });
    await expect(log.validate()).resolves.toBeUndefined();
    expect(log.actorUserId).toBeNull();
    expect(AuditLogSchema.path('createdAt')).toBeDefined();
    expect(AuditLogSchema.path('updatedAt')).toBeUndefined();
  });
  it.each(['action', 'entityType'])('requiere %s', async (field) => {
    await expect(
      new AuditLog({ ...valid, [field]: undefined }).validate(),
    ).rejects.toThrow();
  });
  it.each([
    { actorUserId: 'bad-id' },
    { entityId: 'bad-id' },
    { changes: [] },
    { metadata: 'text' },
    { changes: { nested: { passwordHash: 'secret' } } },
    { metadata: { items: [{ accessToken: 'secret' }] } },
  ])('rechaza %j', async (data) => {
    await expect(
      new AuditLog({ ...valid, ...data }).validate(),
    ).rejects.toThrow();
  });
});
