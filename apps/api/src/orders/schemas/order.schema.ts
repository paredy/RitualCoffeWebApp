import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types, type HydratedDocument } from 'mongoose';
import {
  moneyJson,
  isDocumentArray,
  normalizedCode,
  positiveInteger,
  requiredMoney,
  zeroMoney,
} from '../../common/schema-validation.js';

@Schema({ _id: false })
export class OrderSelectedExtra {
  @Prop(normalizedCode)
  code!: string;

  @Prop({ type: String, required: true, trim: true })
  name!: string;

  @Prop(requiredMoney)
  unitPrice!: Types.Decimal128;

  @Prop(positiveInteger)
  quantity!: number;
}
export const OrderSelectedExtraSchema =
  SchemaFactory.createForClass(OrderSelectedExtra);

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Product', required: true })
  productId!: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  productName!: string;

  @Prop({ ...normalizedCode, required: false, default: null })
  variantCode!: string | null;

  @Prop({ type: String, trim: true, default: null })
  variantName!: string | null;

  @Prop(positiveInteger)
  quantity!: number;

  @Prop(requiredMoney)
  unitPrice!: Types.Decimal128;

  @Prop({
    type: [OrderSelectedExtraSchema],
    required: true,
    default: [],
    validate: isDocumentArray,
  })
  selectedExtras!: OrderSelectedExtra[];

  @Prop(requiredMoney)
  lineTotal!: Types.Decimal128;

  @Prop({ type: String, trim: true })
  notes?: string;
}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

export type OrderDocument = HydratedDocument<Order>;

@Schema({ collection: 'orders', timestamps: true, versionKey: false })
export class Order {
  // Assignment requires an atomic counter in the future service.
  @Prop({ ...positiveInteger, unique: true })
  orderNumber!: number;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;

  @Prop({ type: String, required: true, enum: ['dine_in', 'takeaway'] })
  orderType!: 'dine_in' | 'takeaway';

  @Prop({ type: String, trim: true, default: null })
  tableNumber!: string | null;

  @Prop({ type: String, trim: true, maxlength: 100 })
  customerName?: string;

  @Prop({
    type: [OrderItemSchema],
    required: true,
    default: [],
    validate: {
      validator: (items: unknown) => isDocumentArray(items) && items.length > 0,
      message: 'El pedido requiere al menos un elemento',
    },
  })
  items!: OrderItem[];

  @Prop(requiredMoney)
  subtotal!: Types.Decimal128;

  @Prop(zeroMoney)
  discount!: Types.Decimal128;

  @Prop(requiredMoney)
  total!: Types.Decimal128;

  @Prop({
    type: String,
    required: true,
    default: 'pending',
    enum: ['pending', 'preparing', 'ready', 'delivered', 'cancelled'],
  })
  status!: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

  @Prop({ type: String, trim: true })
  notes?: string;

  @Prop({ type: String, trim: true })
  cancelReason?: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', default: null })
  cancelledBy!: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  cancelledAt!: Date | null;

  @Prop({ type: Date, default: null })
  deliveredAt!: Date | null;
}
export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.pre('validate', function () {
  if (this.orderType === 'dine_in' && !this.tableNumber) {
    this.invalidate('tableNumber', 'El consumo en local requiere mesa');
  }
  if (
    this.orderType === 'takeaway' &&
    this.tableNumber !== null &&
    this.tableNumber !== undefined
  ) {
    this.invalidate('tableNumber', 'Un pedido para llevar no debe tener mesa');
  }
});
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ createdBy: 1, createdAt: -1 });
OrderSchema.index({ orderType: 1, createdAt: -1 });
moneyJson(OrderSchema);
