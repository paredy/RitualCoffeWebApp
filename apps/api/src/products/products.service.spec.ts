import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types, type Model } from 'mongoose';
import type { Category } from '../categories/schemas/category.schema.js';
import type { Product } from './schemas/product.schema.js';
import { ListPublicProductsQueryDto } from './dto/list-public-products-query.dto.js';
import { type PublicProductRecord } from './dto/public-product-response.dto.js';
import { ProductsService } from './products.service.js';

function setup(result: unknown[]) {
  const exec = vi.fn().mockResolvedValue(result);
  const model = { aggregate: vi.fn().mockReturnValue({ exec }) };
  const categories = { collection: { name: 'categories' } };
  return {
    service: new ProductsService(
      model as unknown as Model<Product>,
      categories as unknown as Model<Category>,
    ),
    model,
  };
}

describe('ProductsService', () => {
  it('devuelve lista y paginación vacías', async () => {
    const { service } = setup([{ data: [], total: [] }]);
    await expect(
      service.listPublic(new ListPublicProductsQueryDto()),
    ).resolves.toEqual({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
  });

  it('usa el mismo error para productos inexistentes o no públicos', async () => {
    const { service } = setup([]);
    await expect(service.findPublicBySlug('oculto')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rechaza desplazamientos que exceden la precisión segura antes de consultar MongoDB', async () => {
    const { service, model } = setup([]);
    await expect(
      service.listPublic({ page: Number.MAX_SAFE_INTEGER, limit: 50 }),
    ).rejects.toThrow(BadRequestException);
    expect(model.aggregate).not.toHaveBeenCalled();
  });

  it('transforma importes sin perder precisión y excluye campos y opciones no públicos', async () => {
    const product = {
      _id: new Types.ObjectId(),
      name: 'Capuchino',
      slug: 'capuchino',
      description: '',
      category: {
        _id: new Types.ObjectId(),
        name: 'Cafés',
        slug: 'cafes',
        internalNote: 'privado',
      },
      pricingType: 'variant',
      price: null,
      imageUrl: null,
      isAvailable: true,
      isVisible: true,
      isArchived: false,
      internalNote: 'privado',
      variants: [
        {
          code: 'hidden',
          name: 'Agotado',
          price: Types.Decimal128.fromString('1.00'),
          sortOrder: 0,
          isAvailable: false,
        },
        {
          code: 'large',
          name: 'Grande',
          price: Types.Decimal128.fromString('999999999999999999999.99'),
          sortOrder: 2,
          isAvailable: true,
        },
        {
          code: 'small',
          name: 'Pequeño',
          price: Types.Decimal128.fromString('3.5'),
          sortOrder: 1,
          isAvailable: true,
        },
      ],
      extras: [
        {
          code: 'milk',
          name: 'Leche',
          price: Types.Decimal128.fromString('0.75'),
          maxQuantity: 1,
          isAvailable: true,
          internalNote: 'privado',
        },
        {
          code: 'hidden',
          name: 'Agotado',
          price: Types.Decimal128.fromString('1.00'),
          maxQuantity: 1,
          isAvailable: false,
        },
      ],
    } satisfies PublicProductRecord & {
      isVisible: boolean;
      isArchived: boolean;
      internalNote: string;
      category: PublicProductRecord['category'] & { internalNote: string };
      extras: Array<
        PublicProductRecord['extras'][number] & { internalNote?: string }
      >;
    };
    const { service } = setup([{ data: [product], total: [{ count: 21 }] }]);
    const response = await service.listPublic({ page: 2, limit: 20 });
    expect(response.meta).toEqual({
      page: 2,
      limit: 20,
      total: 21,
      totalPages: 2,
    });
    const data = response.data[0];
    expect(data.id).toBe(product._id.toHexString());
    expect(data.price).toBeNull();
    expect(data.currency).toBe('USD');
    expect(data.variants.map((variant) => variant.price)).toEqual([
      '3.50',
      '999999999999999999999.99',
    ]);
    expect(data.extras).toEqual([
      {
        code: 'milk',
        name: 'Leche',
        price: '0.75',
        isAvailable: true,
        maxQuantity: 1,
      },
    ]);
    expect(JSON.stringify(response)).not.toContain('privado');
    expect(data).not.toHaveProperty('isVisible');
    expect(data).not.toHaveProperty('isArchived');
    expect(data).not.toHaveProperty('_id');
  });
});
