import mongoose from 'mongoose';
import { CoffeeTypeSchema } from './coffee-type.schema.js';

const CoffeeType = mongoose.model('CoffeeTypeValidationTest', CoffeeTypeSchema);
const valid = {
  name: 'Bourbon',
  slug: 'BOURBON',
  classification: 'variety',
  description: 'Variedad botánica.',
};

describe('CoffeeTypeSchema', () => {
  it('normaliza slug y aplica valores predeterminados', async () => {
    const type = new CoffeeType(valid);
    await expect(type.validate()).resolves.toBeUndefined();
    expect(type.slug).toBe('bourbon');
    expect(type.isPublished).toBe(false);
    expect(type.sortOrder).toBe(0);
    expect(type.flavorNotes).toEqual([]);
    expect(type.scientificName).toBeNull();
  });
  it.each(['name', 'slug', 'classification', 'description'])(
    'requiere %s',
    async (field) => {
      await expect(
        new CoffeeType({ ...valid, [field]: undefined }).validate(),
      ).rejects.toThrow();
    },
  );
  it.each([
    { classification: 'drink' },
    { slug: 'bad slug' },
    { sortOrder: -1 },
    { sortOrder: 0.5 },
    { flavorNotes: [{}] },
  ])('rechaza %j', async (data) => {
    await expect(
      new CoffeeType({ ...valid, ...data }).validate(),
    ).rejects.toThrow();
  });
  it('no declara referencias ni acepta relaciones ajenas al esquema', () => {
    const type = new CoffeeType({
      ...valid,
      productId: new mongoose.Types.ObjectId(),
      categoryId: new mongoose.Types.ObjectId(),
    });
    expect(type.toObject()).not.toHaveProperty('productId');
    expect(type.toObject()).not.toHaveProperty('categoryId');
    CoffeeTypeSchema.eachPath((_name, path) =>
      expect(path.options.ref).toBeUndefined(),
    );
    expect(CoffeeTypeSchema.indexes()).toContainEqual([
      { slug: 1 },
      { unique: true },
    ]);
  });
});
