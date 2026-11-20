import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { createConnection, Types, type Connection, type Model } from 'mongoose';
import { randomUUID } from 'node:crypto';
import { AppModule } from '../src/app.module.js';
import { configureHttpApp } from '../src/common/configure-http-app.js';
import type { PublicCategoryResponseDto } from '../src/categories/dto/public-category-response.dto.js';
import type {
  PublicProductListResponseDto,
  PublicProductResponseDto,
} from '../src/products/dto/public-product-response.dto.js';
import { testMongoUri } from './mongo-test-connection.js';

describe('Menú público (Fastify + MongoDB aislado)', () => {
  let app: NestFastifyApplication | undefined;
  let connection: Connection | undefined;
  const run = randomUUID();
  const activeSlug = `active-${run}`;
  const inactiveSlug = `inactive-${run}`;
  const emptySlug = `empty-${run}`;
  const fixedSlug = `fixed-${run}`;
  const variantSlug = `variant-${run}`;
  const excludedSlugs = [
    'hidden',
    'archived',
    'unavailable',
    'inactive-category',
    'orphan',
    'no-variants',
  ].map((name) => `${name}-${run}`);
  const owned: Array<{ model: Model<unknown>; id: Types.ObjectId }> = [];
  let activeId: Types.ObjectId;

  function model(name: string): Model<unknown> {
    return app!.get<Model<unknown>>(getModelToken(name));
  }
  async function insert(name: string, data: Record<string, unknown>) {
    const id = new Types.ObjectId();
    const collectionModel = model(name);
    owned.push({ model: collectionModel, id });
    return collectionModel.create({ ...data, _id: id });
  }
  async function getProducts(options = '') {
    return app!.inject({
      method: 'GET',
      url: `/api/v1/menu/products?category=${activeSlug}${options}`,
    });
  }

  beforeAll(async () => {
    connection = createConnection(testMongoUri(), {
      autoIndex: false,
      autoCreate: false,
      serverSelectionTimeoutMS: 5000,
    });
    await connection.asPromise();
    const fixture = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(getConnectionToken())
      .useValue(connection)
      .compile();
    app = fixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await configureHttpApp(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    for (const name of ['Category', 'Product']) {
      await model(name).createCollection();
      await model(name).createIndexes();
    }

    const active = await insert('Category', {
      name: 'Cafés públicos',
      slug: activeSlug,
      sortOrder: 2,
    });
    activeId = active._id;
    const inactive = await insert('Category', {
      name: 'Categoría privada',
      slug: inactiveSlug,
      isActive: false,
      sortOrder: 1,
    });
    await insert('Category', {
      name: 'Categoría sin productos',
      slug: emptySlug,
      sortOrder: 0,
    });
    const fixed = await insert('Product', {
      name: 'Capuchino',
      slug: fixedSlug,
      categoryId: activeId,
      pricingType: 'fixed',
      price: '3.5',
      isVisible: true,
      extras: [
        {
          code: 'milk',
          name: 'Leche',
          price: '0.75',
          isAvailable: true,
          maxQuantity: 2,
        },
        {
          code: 'hidden',
          name: 'Extra agotado',
          price: '1.00',
          isAvailable: false,
        },
      ],
    });
    // Future/private database properties must not accidentally become API fields.
    await model('Product').collection.updateOne(
      { _id: fixed._id },
      { $set: { internalNote: 'privado' } },
    );
    await insert('Product', {
      name: 'Latte',
      slug: variantSlug,
      categoryId: activeId,
      pricingType: 'variant',
      isVisible: true,
      variants: [
        {
          code: 'hidden',
          name: 'Tamaño agotado',
          price: '1.00',
          isAvailable: false,
          sortOrder: 0,
        },
        { code: 'large', name: 'Grande', price: '4.50', sortOrder: 2 },
        { code: 'small', name: 'Pequeño', price: '2.50', sortOrder: 1 },
      ],
    });
    const exclusions: Record<string, unknown>[] = [
      { isVisible: false },
      { isArchived: true },
      { isAvailable: false },
      { categoryId: inactive._id },
      { categoryId: new Types.ObjectId() },
      {
        pricingType: 'variant',
        price: null,
        variants: [
          { code: 'small', name: 'Agotado', price: '3.50', isAvailable: false },
        ],
      },
    ];
    for (const [index, values] of exclusions.entries()) {
      await insert('Product', {
        name: 'Producto privado',
        slug: excludedSlugs[index],
        categoryId: activeId,
        pricingType: 'fixed',
        price: '3.50',
        isVisible: true,
        ...values,
      });
    }
  }, 30000);

  afterAll(async () => {
    try {
      for (const item of owned) await item.model.deleteOne({ _id: item.id });
    } finally {
      if (app) await app.close();
      if (connection) await connection.close();
    }
  });

  it('lista categorías activas, incluso vacías, ordenadas y sin campos internos', async () => {
    const response = await app!.inject({
      method: 'GET',
      url: '/api/v1/menu/categories',
    });
    expect(response.statusCode).toBe(200);
    const data = response.json<{ data: PublicCategoryResponseDto[] }>().data;
    const own = data.filter((category) => category.slug.endsWith(run));
    expect(own.map((category) => category.slug)).toEqual([
      emptySlug,
      activeSlug,
    ]);
    expect(Object.keys(own[0]).sort()).toEqual(
      ['id', 'name', 'slug', 'description', 'imageUrl'].sort(),
    );
  });

  it('aplica valores predeterminados y solo incluye productos públicos en data y total', async () => {
    const response = await getProducts();
    expect(response.statusCode).toBe(200);
    const body = response.json<PublicProductListResponseDto>();
    expect(body.data.map((product) => product.slug)).toEqual([
      fixedSlug,
      variantSlug,
    ]);
    expect(body.meta).toEqual({ page: 1, limit: 20, total: 2, totalPages: 1 });
  });

  it('serializa precios e identificadores y elimina campos privados y extras agotados', async () => {
    const response = await app!.inject({
      method: 'GET',
      url: `/api/v1/menu/products/${fixedSlug}`,
    });
    expect(response.statusCode).toBe(200);
    const data = response.json<{ data: PublicProductResponseDto }>().data;
    expect(data.price).toBe('3.50');
    expect(data.currency).toBe('USD');
    expect(data.category).toEqual({
      id: activeId.toHexString(),
      name: 'Cafés públicos',
      slug: activeSlug,
    });
    expect(data.id).toMatch(/^[a-f0-9]{24}$/);
    expect(data.variants).toEqual([]);
    expect(data.extras).toEqual([
      {
        code: 'milk',
        name: 'Leche',
        price: '0.75',
        isAvailable: true,
        maxQuantity: 2,
      },
    ]);
    expect(Object.keys(data).sort()).toEqual(
      [
        'id',
        'name',
        'slug',
        'description',
        'category',
        'pricingType',
        'price',
        'currency',
        'imageUrl',
        'isAvailable',
        'variants',
        'extras',
      ].sort(),
    );
    expect(response.body).not.toContain('privado');
    expect(response.body).not.toContain('$numberDecimal');
  });

  it('devuelve únicamente variantes disponibles y ordenadas, igual en listado y detalle', async () => {
    const response = await app!.inject({
      method: 'GET',
      url: `/api/v1/menu/products/${variantSlug}`,
    });
    expect(response.statusCode).toBe(200);
    const detail = response.json<{ data: PublicProductResponseDto }>().data;
    expect(detail.price).toBeNull();
    expect(detail.variants.map((variant) => variant.code)).toEqual([
      'small',
      'large',
    ]);
    expect(detail.variants.map((variant) => variant.price)).toEqual([
      '2.50',
      '4.50',
    ]);
    const listed = (await getProducts())
      .json<PublicProductListResponseDto>()
      .data.find((product) => product.slug === variantSlug);
    expect(listed).toEqual(detail);
  });

  it.each([
    'hidden',
    'archived',
    'unavailable',
    'inactive-category',
    'orphan',
    'no-variants',
    'missing',
  ])('oculta el detalle de %s con el mismo 404', async (name) => {
    const response = await app!.inject({
      method: 'GET',
      url: `/api/v1/menu/products/${name}-${run}`,
    });
    expect(response.statusCode).toBe(404);
    expect(response.json().message).toBe('Producto no encontrado');
  });

  it('pagina con orden estable y mantiene el total filtrado en páginas vacías', async () => {
    const first = (
      await getProducts('&page=1&limit=1')
    ).json<PublicProductListResponseDto>();
    const second = (
      await getProducts('&page=2&limit=1')
    ).json<PublicProductListResponseDto>();
    const beyond = (
      await getProducts('&page=3&limit=1')
    ).json<PublicProductListResponseDto>();
    expect(first.data.map((product) => product.slug)).toEqual([fixedSlug]);
    expect(second.data.map((product) => product.slug)).toEqual([variantSlug]);
    expect(second.meta).toEqual({ page: 2, limit: 1, total: 2, totalPages: 2 });
    expect(beyond.data).toEqual([]);
    expect(beyond.meta).toEqual({ page: 3, limit: 1, total: 2, totalPages: 2 });
  });

  it.each(['empty', 'inactive', 'nonexistent'])(
    'devuelve una lista vacía para categoría %s',
    async (prefix) => {
      const response = await app!.inject({
        method: 'GET',
        url: `/api/v1/menu/products?category=${prefix}-${run}`,
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        data: [],
        meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });
    },
  );

  it('deja de publicar inmediatamente al desactivar la categoría', async () => {
    await model('Category').updateOne(
      { _id: activeId },
      { $set: { isActive: false } },
    );
    try {
      const list = await getProducts();
      const detail = await app!.inject({
        method: 'GET',
        url: `/api/v1/menu/products/${fixedSlug}`,
      });
      expect(list.json().meta.total).toBe(0);
      expect(list.json().data).toEqual([]);
      expect(detail.statusCode).toBe(404);
    } finally {
      await model('Category').updateOne(
        { _id: activeId },
        { $set: { isActive: true } },
      );
    }
  });

  it.each([
    'page=0',
    'page=-1',
    'page=1.5',
    'page=',
    'page=1e2',
    'page=Infinity',
    'page=1&page=2',
    'limit=0',
    'limit=51',
    'limit=1&limit=2',
    'category=bad%20slug',
    'category=',
    'category=cafes&category=postres',
    'category[$ne]=null',
    'isVisible=false',
    'includeArchived=true',
    'page=9007199254740991&limit=50',
  ])(
    'rechaza parámetros inválidos o intentos de alterar filtros: %s',
    async (query) => {
      const response = await app!.inject({
        method: 'GET',
        url: `/api/v1/menu/products?${query}`,
      });
      expect(response.statusCode).toBe(400);
    },
  );

  it.each([
    '/menu/categories?page=1',
    `/menu/products/${fixedSlug}?includeArchived=true`,
    '/menu/products/bad%20slug',
  ])('valida también categorías y detalle: %s', async (path) => {
    const response = await app!.inject({
      method: 'GET',
      url: `/api/v1${path}`,
    });
    expect(response.statusCode).toBe(400);
  });

  it.each(['POST', 'PATCH', 'DELETE'] as const)(
    'no expone escritura pública mediante %s',
    async (method) => {
      const response = await app!.inject({
        method,
        url: `/api/v1/menu/products/${fixedSlug}`,
      });
      expect(response.statusCode).toBe(404);
    },
  );
});
