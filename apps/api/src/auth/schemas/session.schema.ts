import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types, type HydratedDocument } from 'mongoose';

export type SessionDocument = HydratedDocument<Session>;

@Schema({ collection: 'sessions', timestamps: true, versionKey: false })
export class Session {
  // Only SHA-256(token), never the cookie value itself.
  @Prop({
    type: String,
    required: true,
    unique: true,
    select: false,
    match: /^[a-f0-9]{64}$/,
  })
  tokenHash!: string;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId!: Types.ObjectId;

  @Prop({ type: Date, required: true })
  expiresAt!: Date;
}
export const SessionSchema = SchemaFactory.createForClass(Session);
// TTL is housekeeping; every authentication query also checks expiresAt > now.
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SessionSchema.set('toJSON', {
  transform: (_document, result) => {
    Reflect.deleteProperty(result, 'tokenHash');
    return result;
  },
});
