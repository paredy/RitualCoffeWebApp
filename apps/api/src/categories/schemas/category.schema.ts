
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({
  collection: 'categories',
  timestamps: true,
  versionKey: false,
})
export class Category {
  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 80,
  })
  name!: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  })
  slug!: string;

  @Prop({
    trim: true,
    maxlength: 500,
    default: '',
  })
  description!: string;

  @Prop({
    type: String,
    trim: true,
    default: null,
  })
  imageUrl!: string | null;

  @Prop({
    type: Number,
    min: 0,
    default: 0,
    validate: Number.isInteger,
  })
  sortOrder!: number;

  @Prop({
    type: Boolean,
    default: true,
  })
  isActive!: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ isActive: 1, sortOrder: 1 });
