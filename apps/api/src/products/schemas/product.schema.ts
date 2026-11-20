import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import {
  moneyJson,
  normalizedCode,
  nonNegativeInteger,
  positiveInteger,
  requiredMoney,
  optionalMoney,
  isDocumentArray,
} from '../../common/schema-validation.js';

export type ProductDocument = HydratedDocument<Product>;

// SUBDOCUMENTO: variantes (pequeño, mediano, grande)
@Schema({ _id: false })
export class ProductVariant {
  @Prop(normalizedCode)
  code!: string;

  @Prop({ type: String, required: true, trim: true })
  name!: string;

  @Prop(requiredMoney)
  price!: Types.Decimal128;

  @Prop({ type: Boolean, default: true })
  isAvailable!: boolean;

  @Prop(nonNegativeInteger)
  sortOrder!: number;
}

export const ProductVariantSchema =
  SchemaFactory.createForClass(ProductVariant);

// SUBDOCUMENTO: extras
@Schema({ _id: false })
export class ProductExtra {
  @Prop(normalizedCode)
  code!: string;

  @Prop({ type: String, required: true, trim: true })
  name!: string;

  @Prop(requiredMoney)
  price!: Types.Decimal128;

  @Prop({ type: Boolean, default: true })
  isAvailable!: boolean;

  @Prop({ ...positiveInteger, default: 1 })
  maxQuantity!: number;
}

export const ProductExtraSchema = SchemaFactory.createForClass(ProductExtra);

// DOCUMENTO PRINCIPAL: producto
@Schema({
  collection: 'products',
  timestamps: true,
  versionKey: false,
})
export class Product {
  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 120,
  })
  name!: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  })
  slug!: string;

  @Prop({
    type: String,
    trim: true,
    maxlength: 1000,
    default: '',
  })
  description!: string;

  // The future product service must verify that this category actually exists.
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Category',
    required: true,
  })
  categoryId!: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: ['fixed', 'variant'],
  })
  pricingType!: 'fixed' | 'variant';

  @Prop(optionalMoney)
  price!: Types.Decimal128 | null;

  @Prop({
    type: [ProductVariantSchema],
    default: [],
    validate: isDocumentArray,
  })
  variants!: ProductVariant[];

  @Prop({
    type: [ProductExtraSchema],
    default: [],
    validate: isDocumentArray,
  })
  extras!: ProductExtra[];

  @Prop({
    type: String,
    trim: true,
    default: null,
  })
  imageUrl!: string | null;

  @Prop({
    type: String,
    trim: true,
    default: null,
  })
  origin?: string | null;

  @Prop({
    type: String,
    trim: true,
    default: null,
  })
  roastLevel?: string | null;

  @Prop({
    type: [String],
    default: [],
  })
  tastingNotes?: string[];

  @Prop({
    type: String,
    trim: true,
    default: null,
  })
  extractionMethod?: string | null;

  @Prop({
    type: String,
    trim: true,
    default: null,
  })
  temperature?: string | null;

  @Prop({
    type: [String],
    default: [],
  })
  allergens?: string[];

  @Prop({
    type: Boolean,
    default: false,
  })
  isSpecialty?: boolean;

  @Prop({ type: Boolean, default: true })
  isAvailable!: boolean;

  @Prop({ type: Boolean, default: false })
  isVisible!: boolean;

  @Prop({ type: Boolean, default: false })
  isArchived!: boolean;

  @Prop(nonNegativeInteger)
  sortOrder!: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Reglas según el tipo de precio.
ProductSchema.pre('validate', function () {
  const pricingType = this.get('pricingType');
  const price = this.get('price');
  const variants = (this.get('variants') ?? []) as unknown[];
  if (this.get('variants') === null)
    this.invalidate('variants', 'Las variantes deben ser un array');
  if (this.get('extras') === null)
    this.invalidate('extras', 'Los extras deben ser un array');

  if (pricingType === 'fixed') {
    if (price === null || price === undefined) {
      this.invalidate('price', 'Un producto de precio fijo necesita un precio');
    }

    if (variants.length > 0) {
      this.invalidate(
        'variants',
        'Un producto de precio fijo no debe tener variantes',
      );
    }
  }

  if (pricingType === 'variant') {
    if (variants.length === 0) {
      this.invalidate(
        'variants',
        'Un producto con variantes necesita al menos una',
      );
    }

    if (price !== null && price !== undefined) {
      this.invalidate('price', 'El precio debe definirse en cada variante');
    }
  }
});

// Evitar códigos repetidos en variantes o extras.
ProductSchema.pre('validate', function () {
  for (const field of ['variants', 'extras'] as const) {
    const items = (this.get(field) ?? []) as Array<{ code: string } | null>;
    const codes = items.map((item) => item?.code);

    if (new Set(codes).size !== codes.length) {
      this.invalidate(field, `No se permiten códigos repetidos en ${field}`);
    }
  }
});

// Índice para consultar el menú público.
ProductSchema.index({
  categoryId: 1,
  isVisible: 1,
  isArchived: 1,
  sortOrder: 1,
});
moneyJson(ProductSchema);
