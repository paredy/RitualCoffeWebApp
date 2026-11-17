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
import { modelDefinitions } from '../src/database/model-definitions.js';
import { testMongoUri } from './mongo-test-connection.js';

describe('API Fastify y modelos MongoDB (e2e)', () => {
  let app: NestFastifyApplication | undefined;
  let connection: Connection | undefined;
  const run = randomUUID();
  const owned: Array<{ model: Model<unknown>; id: Types.ObjectId }> = [];

  async function insert(name: string, values: Record<string, unknown>) {
    const model = app!.get<Model<unknown>>(getModelToken(name));
    const id = new Types.ObjectId();
    owned.push({ model, id });
    return model.create({ ...values, _id: id });
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
    app.setGlobalPrefix('api/v1');
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    for (const definition of modelDefinitions) {
      const model = app.get<Model<unknown>>(getModelToken(definition.name));
      await model.createCollection();
      await model.createIndexes();
    }
  }, 30000);

  afterAll(async () => {
    try {
      // Remove only documents owned by this run, never collections or databases.
      for (const { model, id } of owned) await model.deleteOne({ _id: id });
    } finally {
      if (app) await app.close();
      if (connection) await connection.close();
    }
  });

  it('responde con Fastify en el prefijo real', async () => {
    const response = await app!.inject({ method: 'GET', url: '/api/v1' });
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('Hello World!');
  });

  it('registra las siete colecciones y sus índices', async () => {
    expect(modelDefinitions).toHaveLength(7);
    for (const definition of modelDefinitions) {
      const model = app!.get<Model<unknown>>(getModelToken(definition.name));
      const indexes = await model.collection.indexes();
      for (const [keys, options] of definition.schema.indexes()) {
        const index = indexes.find(
          (candidate) => JSON.stringify(candidate.key) === JSON.stringify(keys),
        );
        expect(index).toBeDefined();
        if (options.unique) expect(index?.unique).toBe(true);
      }
    }
  });

  it('persiste instantáneas, Decimal128, timestamps y unicidad real', async () => {
    const user = await insert('User', {
      name: 'Prueba aislada',
      email: `${run}@example.test`,
      passwordHash: '$argon2id$test-only',
      role: 'barista',
    });
    const category = await insert('Category', {
      name: 'Prueba aislada',
      slug: `test-${run}`,
    });
    const product = await insert('Product', {
      name: 'Nombre original',
      slug: `test-${run}`,
      categoryId: category._id,
      pricingType: 'fixed',
      price: '3.50',
    });
    const order = await insert('Order', {
      orderNumber: Date.now(),
      createdBy: user._id,
      orderType: 'takeaway',
      items: [
        {
          productId: product._id,
          productName: 'Nombre original',
          quantity: 1,
          unitPrice: '3.50',
          lineTotal: '3.50',
        },
      ],
      subtotal: '3.50',
      total: '3.50',
    });
    const invoice = await insert('Invoice', {
      invoiceNumber: run,
      issuedAt: new Date(),
      createdBy: user._id,
      orderId: order._id,
      items: [
        {
          productId: product._id,
          description: 'Descripción original',
          quantity: 1,
          unitPrice: '3.50',
          subtotal: '3.50',
        },
      ],
      subtotal: '3.50',
      total: '3.50',
    });
    const log = await insert('AuditLog', {
      actorUserId: user._id,
      action: 'product.price_updated',
      entityType: 'Product',
      entityId: product._id,
      changes: { price: { before: '3.50', after: '4.00' } },
    });
    await insert('CoffeeType', {
      name: 'Prueba botánica',
      slug: `test-${run}`,
      classification: 'variety',
      description: 'Prueba aislada',
    });

    const products = app!.get<Model<unknown>>(getModelToken('Product'));
    const orders = app!.get<Model<unknown>>(getModelToken('Order'));
    const invoices = app!.get<Model<unknown>>(getModelToken('Invoice'));
    await products.updateOne(
      { _id: product._id },
      { $set: { name: 'Nombre cambiado', price: '4.00' } },
      { runValidators: true },
    );
    expect(JSON.stringify(await orders.findById(order._id).lean())).toContain(
      'Nombre original',
    );
    expect(
      JSON.stringify(await invoices.findById(invoice._id).lean()),
    ).toContain('Descripción original');
    const rawOrder = await orders.collection.findOne({ _id: order._id });
    expect(rawOrder?.subtotal).toBeInstanceOf(Types.Decimal128);
    expect(rawOrder?.subtotal.toString()).toBe('3.50');
    expect(rawOrder?.createdAt).toBeInstanceOf(Date);
    expect(rawOrder?.updatedAt).toBeInstanceOf(Date);
    const logs = app!.get<Model<unknown>>(getModelToken('AuditLog'));
    const rawLog = await logs.collection.findOne({ _id: log._id });
    expect(rawLog?.createdAt).toBeInstanceOf(Date);
    expect(rawLog).not.toHaveProperty('updatedAt');
    const users = app!.get<Model<unknown>>(getModelToken('User'));
    expect(await users.findById(user._id).lean()).not.toHaveProperty(
      'passwordHash',
    );
    await expect(
      insert('User', {
        name: 'Duplicado',
        email: `${run}@example.test`,
        passwordHash: '$argon2id$test-only',
        role: 'barista',
      }),
    ).rejects.toMatchObject({ code: 11000 });
    await expect(
      insert('Category', { name: 'Duplicado', slug: `test-${run}` }),
    ).rejects.toMatchObject({ code: 11000 });
    await expect(
      insert('Order', {
        orderNumber: order.get('orderNumber'),
        createdBy: user._id,
        orderType: 'takeaway',
        items: order.get('items'),
        subtotal: '3.50',
        total: '3.50',
      }),
    ).rejects.toMatchObject({ code: 11000 });
  });
});
