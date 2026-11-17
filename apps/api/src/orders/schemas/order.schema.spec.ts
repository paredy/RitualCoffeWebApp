import mongoose from 'mongoose';
import { OrderSchema } from './order.schema.js';

const Order = mongoose.model('OrderValidationTest', OrderSchema);
const item = {
  productId: new mongoose.Types.ObjectId(),
  productName: 'Capuchino histórico',
  quantity: 2,
  unitPrice: '3.50',
  lineTotal: '8.50',
  selectedExtras: [
    { code: 'milk', name: 'Leche', unitPrice: '0.75', quantity: 2 },
  ],
};
const valid = {
  orderNumber: 1,
  createdBy: new mongoose.Types.ObjectId(),
  orderType: 'takeaway',
  items: [item],
  subtotal: '8.50',
  total: '8.50',
};

describe('OrderSchema', () => {
  it('rechaza elementos nulos de productos y extras', async () => {
    await expect(
      new Order({ ...valid, items: [null] }).validate(),
    ).rejects.toThrow(mongoose.Error.ValidationError);
    await expect(
      new Order({
        ...valid,
        items: [{ ...item, selectedExtras: [null] }],
      }).validate(),
    ).rejects.toThrow(mongoose.Error.ValidationError);
  });
  it('acepta instantáneas históricas y serializa importes anidados', async () => {
    const order = new Order(valid);
    await expect(order.validate()).resolves.toBeUndefined();
    expect(order.status).toBe('pending');
    expect(order.discount.toString()).toBe('0.00');
    const json = JSON.parse(JSON.stringify(order));
    expect(json.items[0].productName).toBe('Capuchino histórico');
    expect(json.items[0].unitPrice).toBe('3.50');
    expect(json.items[0].selectedExtras[0].unitPrice).toBe('0.75');
    expect(order.tableNumber).toBeNull();
  });
  it.each(['orderNumber', 'createdBy', 'orderType', 'subtotal', 'total'])(
    'requiere %s',
    async (field) => {
      await expect(
        new Order({ ...valid, [field]: undefined }).validate(),
      ).rejects.toThrow();
    },
  );
  it.each([undefined, null, []])('rechaza items vacíos: %j', async (items) => {
    await expect(new Order({ ...valid, items }).validate()).rejects.toThrow();
  });
  it('requiere mesa para consumo en local', async () => {
    await expect(
      new Order({
        ...valid,
        orderType: 'dine_in',
        tableNumber: '  ',
      }).validate(),
    ).rejects.toThrow();
    await expect(
      new Order({
        ...valid,
        orderType: 'dine_in',
        tableNumber: 'A-1',
      }).validate(),
    ).resolves.toBeUndefined();
  });
  it('rechaza mesa para llevar', async () => {
    await expect(
      new Order({ ...valid, tableNumber: '1' }).validate(),
    ).rejects.toThrow();
  });
  it.each([
    { orderNumber: 0 },
    { orderNumber: 1.5 },
    { createdBy: 'bad-id' },
    { orderType: 'delivery' },
    { status: 'paid' },
    { customerName: 'a'.repeat(101) },
    { deliveredAt: 'invalid' },
  ])('rechaza %j', async (data) => {
    await expect(new Order({ ...valid, ...data }).validate()).rejects.toThrow();
  });
  it.each(['subtotal', 'discount', 'total'])('valida %s', async (field) => {
    for (const amount of ['-1.00', '1.001', 'NaN', 'Infinity', 'invalid']) {
      await expect(
        new Order({ ...valid, [field]: amount }).validate(),
      ).rejects.toThrow();
    }
  });
  it.each([0, -1, 1.5])(
    'rechaza cantidad %s en productos y extras',
    async (quantity) => {
      await expect(
        new Order({ ...valid, items: [{ ...item, quantity }] }).validate(),
      ).rejects.toThrow();
      await expect(
        new Order({
          ...valid,
          items: [
            {
              ...item,
              selectedExtras: [{ ...item.selectedExtras[0], quantity }],
            },
          ],
        }).validate(),
      ).rejects.toThrow();
    },
  );
  it.each(['unitPrice', 'lineTotal'])(
    'rechaza %s inválido en productos',
    async (field) => {
      await expect(
        new Order({
          ...valid,
          items: [{ ...item, [field]: '3.001' }],
        }).validate(),
      ).rejects.toThrow();
    },
  );
  it('rechaza importes inválidos de extras y referencias ausentes', async () => {
    await expect(
      new Order({
        ...valid,
        items: [
          {
            ...item,
            selectedExtras: [{ ...item.selectedExtras[0], unitPrice: '-0.01' }],
          },
        ],
      }).validate(),
    ).rejects.toThrow();
    await expect(
      new Order({
        ...valid,
        items: [{ ...item, productId: undefined }],
      }).validate(),
    ).rejects.toThrow();
  });
  it('declara índices y no contiene campos de pago', () => {
    expect(OrderSchema.indexes()).toContainEqual([
      { orderNumber: 1 },
      { unique: true },
    ]);
    expect(OrderSchema.path('paymentMethod')).toBeUndefined();
    expect(OrderSchema.path('paymentStatus')).toBeUndefined();
  });
});
