import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types, type HydratedDocument } from 'mongoose';

// Defense in depth; future callers must still allowlist relevant, non-sensitive fields.
const sensitiveKey =
  /password|passwd|hash|token|secret|credential|authorization|cookie/i;
function containsSensitiveKey(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some(containsSensitiveKey);
  return Object.entries(value).some(
    ([key, item]) => sensitiveKey.test(key) || containsSensitiveKey(item),
  );
}
function isSafeObject(value: unknown): boolean {
  return (
    value == null ||
    (typeof value === 'object' &&
      Object.getPrototypeOf(value) === Object.prototype &&
      !containsSensitiveKey(value))
  );
}
const auditObject = {
  type: SchemaTypes.Mixed,
  validate: {
    validator: isSafeObject,
    message: 'La auditoría requiere un objeto sin claves sensibles',
  },
};
export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema({
  collection: 'audit_logs',
  timestamps: { createdAt: true, updatedAt: false },
  versionKey: false,
})
export class AuditLog {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', default: null })
  actorUserId!: Types.ObjectId | null;
  @Prop({ type: String, required: true, trim: true })
  action!: string;
  @Prop({ type: String, required: true, trim: true })
  entityType!: string;
  @Prop({ type: SchemaTypes.ObjectId, default: null })
  entityId!: Types.ObjectId | null;
  @Prop(auditObject)
  changes?: Record<string, unknown>;
  @Prop(auditObject)
  metadata?: Record<string, unknown>;
}
export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ actorUserId: 1 });
