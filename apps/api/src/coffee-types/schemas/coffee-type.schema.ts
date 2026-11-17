import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import {
  nonNegativeInteger,
  normalizedCode,
} from '../../common/schema-validation.js';

export type CoffeeTypeDocument = HydratedDocument<CoffeeType>;

@Schema({ collection: 'coffee_types', timestamps: true, versionKey: false })
export class CoffeeType {
  @Prop({ type: String, required: true, trim: true })
  name!: string;

  @Prop({ ...normalizedCode, unique: true })
  slug!: string;

  @Prop({ type: String, required: true, enum: ['species', 'variety'] })
  classification!: 'species' | 'variety';

  @Prop({ type: String, trim: true, default: null })
  scientificName!: string | null;

  @Prop({ type: String, required: true, trim: true })
  description!: string;

  @Prop({ type: String, trim: true, default: null })
  origin!: string | null;

  @Prop({ type: [{ type: String, trim: true }], required: true, default: [] })
  flavorNotes!: string[];

  @Prop({ type: String, trim: true, default: null })
  imageUrl!: string | null;

  @Prop({ type: Boolean, default: false })
  isPublished!: boolean;

  @Prop(nonNegativeInteger)
  sortOrder!: number;
}
export const CoffeeTypeSchema = SchemaFactory.createForClass(CoffeeType);
CoffeeTypeSchema.index({ classification: 1, isPublished: 1, sortOrder: 1 });
