import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types, type HydratedDocument } from 'mongoose';
import {
  moneyJson,
  isDocumentArray,
  requiredMoney,
  zeroMoney,
} from '../../common/schema-validation.js';

@Schema({ _id: false })
export class InvoiceCustomer {
  @Prop({ type: String, trim: true })
  name?: string;
  @Prop({ type: String, trim: true })
  identificationType?: string;
  @Prop({ type: String, trim: true })
  identificationNumber?: string;
  @Prop({ type: String, trim: true })
  email?: string;
  @Prop({ type: String, trim: true })
  address?: string;
}
export const InvoiceCustomerSchema =
  SchemaFactory.createForClass(InvoiceCustomer);

@Schema({ _id: false })
export class InvoiceItem {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Product', default: null })
  productId!: Types.ObjectId | null;
  @Prop({ type: String, required: true, trim: true })
  description!: string;
  // Historical documents may contain fractional quantities.
  @Prop({
    type: Number,
    required: true,
    validate: {
      validator: (value: number) => Number.isFinite(value) && value > 0,
      message: 'La cantidad debe ser finita y positiva',
    },
  })
  quantity!: number;
  @Prop(requiredMoney)
  unitPrice!: Types.Decimal128;
  @Prop(requiredMoney)
  subtotal!: Types.Decimal128;
}
export const InvoiceItemSchema = SchemaFactory.createForClass(InvoiceItem);
export type InvoiceDocument = HydratedDocument<Invoice>;

@Schema({ collection: 'invoices', timestamps: true, versionKey: false })
export class Invoice {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Order', default: null })
  orderId!: Types.ObjectId | null;
  // Not globally unique: issuer, establishment and series remain undefined.
  @Prop({ type: String, required: true, trim: true })
  invoiceNumber!: string;
  @Prop({ type: Date, required: true })
  issuedAt!: Date;
  @Prop({ type: InvoiceCustomerSchema, default: undefined })
  customer?: InvoiceCustomer;
  @Prop({ type: [InvoiceItemSchema], default: [], validate: isDocumentArray })
  items!: InvoiceItem[];
  @Prop(requiredMoney)
  subtotal!: Types.Decimal128;
  @Prop(zeroMoney)
  discount!: Types.Decimal128;
  @Prop(zeroMoney)
  tax!: Types.Decimal128;
  @Prop(requiredMoney)
  total!: Types.Decimal128;
  @Prop({ type: String, required: true, enum: ['USD'], default: 'USD' })
  currency!: 'USD';
  @Prop({ type: String, trim: true, default: null })
  paymentMethod!: string | null;
  // No fiscal statuses or lifecycle rules are assumed.
  @Prop({ type: String, trim: true })
  status?: string;
  @Prop({ type: String, trim: true })
  notes?: string;
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;
}
export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
moneyJson(InvoiceSchema);
