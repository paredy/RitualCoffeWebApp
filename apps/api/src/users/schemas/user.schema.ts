import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { USERNAME_PATTERN } from '../username.constants.js';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users', timestamps: true, versionKey: false })
export class User {
  @Prop({
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    minlength: 3,
    maxlength: 30,
    match: USERNAME_PATTERN,
  })
  username!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  })
  name!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  })
  email!: string;

  // Must be produced by the future trusted password-hashing layer.
  @Prop({ type: String, required: true, select: false })
  passwordHash!: string;

  @Prop({ type: String, required: true, enum: ['admin', 'barista'] })
  role!: 'admin' | 'barista';

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  @Prop({ type: Date, default: null })
  lastLoginAt!: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.set('toJSON', {
  transform: (_document, result) => {
    Reflect.deleteProperty(result, 'passwordHash');
    return result;
  },
});
