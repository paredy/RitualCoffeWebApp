import type { ModelDefinition } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema.js';
import {
  Category,
  CategorySchema,
} from '../categories/schemas/category.schema.js';
import { Product, ProductSchema } from '../products/schemas/product.schema.js';
import { Order, OrderSchema } from '../orders/schemas/order.schema.js';
import { Invoice, InvoiceSchema } from '../invoices/schemas/invoice.schema.js';
import {
  AuditLog,
  AuditLogSchema,
} from '../audit-logs/schemas/audit-log.schema.js';
import {
  CoffeeType,
  CoffeeTypeSchema,
} from '../coffee-types/schemas/coffee-type.schema.js';

// Same schemas registered by feature modules; no duplicated definitions.
export const modelDefinitions: ModelDefinition[] = [
  { name: User.name, schema: UserSchema },
  { name: Category.name, schema: CategorySchema },
  { name: Product.name, schema: ProductSchema },
  { name: Order.name, schema: OrderSchema },
  { name: Invoice.name, schema: InvoiceSchema },
  { name: AuditLog.name, schema: AuditLogSchema },
  { name: CoffeeType.name, schema: CoffeeTypeSchema },
];
