import mongoose from 'mongoose';
import { InvoiceSchema } from './invoice.schema.js';

const Invoice = mongoose.model('InvoiceValidationTest', InvoiceSchema);
const valid = {
  invoiceNumber: '001-001-1',
  issuedAt: new Date(),
  createdBy: new mongoose.Types.ObjectId(),
  subtotal: '3.50',
  total: '3.50',
  items: [
    {
      description: 'Descripción histórica',
      quantity: 1,
      unitPrice: '3.50',
      subtotal: '3.50',
    },
  ],
};

describe('InvoiceSchema', () => {
  it('rechaza conceptos nulos', async () => {
    await expect(
      new Invoice({ ...valid, items: [null] }).validate(),
    ).rejects.toThrow();
  });
  it('acepta un comprobante sin pedido ni producto y conserva su descripción', async () => {
    const invoice = new Invoice(valid);
    await expect(invoice.validate()).resolves.toBeUndefined();
    expect(invoice.currency).toBe('USD');
    expect(invoice.orderId).toBeNull();
    expect(invoice.items[0].productId).toBeNull();
    const json = JSON.parse(JSON.stringify(invoice));
    expect(json.items[0].description).toBe('Descripción histórica');
    expect(json.items[0].unitPrice).toBe('3.50');
    expect(json.tax).toBe('0.00');
  });
  it.each(['invoiceNumber', 'issuedAt', 'createdBy', 'subtotal', 'total'])(
    'requiere %s',
    async (field) => {
      await expect(
        new Invoice({ ...valid, [field]: undefined }).validate(),
      ).rejects.toThrow();
    },
  );
  it.each(['subtotal', 'discount', 'tax', 'total'])(
    'valida %s',
    async (field) => {
      for (const amount of ['-0.01', '1.001', 'NaN', 'Infinity', 'invalid']) {
        await expect(
          new Invoice({ ...valid, [field]: amount }).validate(),
        ).rejects.toThrow();
      }
    },
  );
  it.each([
    { currency: 'EUR' },
    { issuedAt: 'invalid' },
    { orderId: 'bad-id' },
    { createdBy: 'bad-id' },
    { items: [{ ...valid.items[0], quantity: -1 }] },
    { items: [{ ...valid.items[0], quantity: 0 }] },
    { items: [{ ...valid.items[0], unitPrice: '0.001' }] },
    { items: [{ ...valid.items[0], subtotal: '-1' }] },
  ])('rechaza %j', async (data) => {
    await expect(
      new Invoice({ ...valid, ...data }).validate(),
    ).rejects.toThrow();
  });
  it('permite cantidades fraccionarias y estados históricos sin inventar reglas fiscales', async () => {
    await expect(
      new Invoice({
        ...valid,
        status: 'imported',
        items: [{ ...valid.items[0], quantity: 0.5 }],
      }).validate(),
    ).resolves.toBeUndefined();
    expect(InvoiceSchema.path('invoiceNumber').options.unique).not.toBe(true);
  });
});
