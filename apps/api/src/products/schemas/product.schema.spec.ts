import { describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { ProductSchema } from './product.schema.js';

const ProductModel = mongoose.model('ProductValidationTest', ProductSchema);

const categoryId = new mongoose.Types.ObjectId();

function createProduct(data: Record<string, unknown>) {
  return new ProductModel({
    name: 'Capuchino',
    slug: 'capuchino-test',
    categoryId,
    ...data,
  });
}

describe('ProductSchema', () => {
  it.each(['variants', 'extras'])(
    'rechaza elementos nulos en %s',
    async (field) => {
      await expect(
        createProduct({
          pricingType: 'fixed',
          price: '3.50',
          [field]: [null],
        }).validate(),
      ).rejects.toThrow(mongoose.Error.ValidationError);
    },
  );
  it.each([0.5, -1])(
    'rechaza orden inválido %s en producto y variantes',
    async (sortOrder) => {
      await expect(
        createProduct({
          pricingType: 'fixed',
          price: '3.50',
          sortOrder,
        }).validate(),
      ).rejects.toThrow();
      await expect(
        createProduct({
          pricingType: 'variant',
          variants: [
            { code: 'small', name: 'Pequeño', price: '3.50', sortOrder },
          ],
        }).validate(),
      ).rejects.toThrow();
    },
  );

  it.each([0, -1, 1.5])('rechaza máximo de extras %s', async (maxQuantity) => {
    await expect(
      createProduct({
        pricingType: 'fixed',
        price: '3.50',
        extras: [{ code: 'milk', name: 'Leche', price: '0.75', maxQuantity }],
      }).validate(),
    ).rejects.toThrow();
  });

  it('normaliza códigos antes de comprobar duplicados', async () => {
    await expect(
      createProduct({
        pricingType: 'variant',
        variants: [
          { code: ' SMALL ', name: 'Pequeño', price: '3.50' },
          { code: 'small', name: 'Otro', price: '4.00' },
        ],
      }).validate(),
    ).rejects.toThrow();
  });

  it.each(['bad code', 'with_underscore', '-invalid'])(
    'rechaza código %s en variantes y extras',
    async (code) => {
      await expect(
        createProduct({
          pricingType: 'variant',
          variants: [{ code, name: 'Pequeño', price: '3.50' }],
        }).validate(),
      ).rejects.toThrow();
      await expect(
        createProduct({
          pricingType: 'fixed',
          price: '3.50',
          extras: [{ code, name: 'Leche', price: '0.75' }],
        }).validate(),
      ).rejects.toThrow();
    },
  );

  it('rechaza mezclar precio fijo con variantes o precio principal con variantes', async () => {
    const variants = [{ code: 'small', name: 'Pequeño', price: '3.50' }];
    await expect(
      createProduct({
        pricingType: 'fixed',
        price: '3.50',
        variants,
      }).validate(),
    ).rejects.toThrow();
    await expect(
      createProduct({
        pricingType: 'variant',
        price: '3.50',
        variants,
      }).validate(),
    ).rejects.toThrow();
  });

  it.each(['variants', 'extras'])(
    'rechaza %s nulo sin lanzar un TypeError en hooks',
    async (field) => {
      await expect(
        createProduct({
          pricingType: 'fixed',
          price: '3.50',
          [field]: null,
        }).validate(),
      ).rejects.toThrow(mongoose.Error.ValidationError);
    },
  );

  it('serializa precios como cadenas y aplica valores predeterminados', async () => {
    const product = createProduct({
      pricingType: 'fixed',
      price: '3.5',
      extras: [{ code: ' MILK ', name: 'Leche', price: '0.75' }],
    });
    await expect(product.validate()).resolves.toBeUndefined();
    expect(product.isVisible).toBe(false);
    expect(product.isAvailable).toBe(true);
    expect(product.isArchived).toBe(false);
    const json = JSON.parse(JSON.stringify(product));
    expect(json.price).toBe('3.50');
    expect(json.extras[0].price).toBe('0.75');
    expect(json.extras[0].code).toBe('milk');
  });
  it('acepta un producto simple con precio decimal', async () => {
    const product = createProduct({
      pricingType: 'fixed',
      price: '3.50',
    });

    await expect(product.validate()).resolves.toBeUndefined();

    expect(product.price?.toString()).toBe('3.50');
  });

  it('rechaza un producto simple sin precio', async () => {
    const product = createProduct({
      pricingType: 'fixed',
    });

    await expect(product.validate()).rejects.toThrow();
  });

  it('acepta un producto con tamaños', async () => {
    const product = createProduct({
      pricingType: 'variant',
      variants: [
        {
          code: 'small',
          name: 'Pequeño',
          price: '2.50',
        },
        {
          code: 'large',
          name: 'Grande',
          price: '4.50',
        },
      ],
    });

    await expect(product.validate()).resolves.toBeUndefined();
  });

  it('rechaza un producto configurable sin variantes', async () => {
    const product = createProduct({
      pricingType: 'variant',
      variants: [],
    });

    await expect(product.validate()).rejects.toThrow();
  });

  it('rechaza precios con más de dos decimales', async () => {
    const product = createProduct({
      pricingType: 'fixed',
      price: '3.999',
    });

    await expect(product.validate()).rejects.toThrow();
  });

  it('rechaza precios negativos', async () => {
    const product = createProduct({
      pricingType: 'fixed',
      price: '-2.50',
    });

    await expect(product.validate()).rejects.toThrow();
  });

  it('rechaza variantes con códigos duplicados', async () => {
    const product = createProduct({
      pricingType: 'variant',
      variants: [
        {
          code: 'medium',
          name: 'Mediano',
          price: '3.50',
        },
        {
          code: 'medium',
          name: 'Mediano especial',
          price: '4.00',
        },
      ],
    });

    await expect(product.validate()).rejects.toThrow();
  });

  it('rechaza extras con códigos duplicados', async () => {
    const product = createProduct({
      pricingType: 'fixed',
      price: '3.50',
      extras: [
        {
          code: 'oat-milk',
          name: 'Leche de avena',
          price: '0.75',
        },
        {
          code: 'oat-milk',
          name: 'Otra leche de avena',
          price: '0.50',
        },
      ],
    });

    await expect(product.validate()).rejects.toThrow();
  });

  it('rechaza un producto sin categoría', async () => {
    const product = createProduct({
      pricingType: 'fixed',
      price: '3.50',
      categoryId: undefined,
    });

    await expect(product.validate()).rejects.toThrow();
  });
});
