import { describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { CategorySchema } from './category.schema.js';

const CategoryModel = mongoose.model('CategoryValidationTest', CategorySchema);

describe('CategorySchema', () => {
  it('aplica valores predeterminados y normaliza slug', async () => {
    const category = new CategoryModel({ name: ' Café ', slug: ' CAFE ' });
    await expect(category.validate()).resolves.toBeUndefined();
    expect(category.name).toBe('Café');
    expect(category.slug).toBe('cafe');
    expect(category.sortOrder).toBe(0);
    expect(category.isActive).toBe(true);
    expect(category.imageUrl).toBeNull();
  });
  it.each([
    { sortOrder: 0.5 },
    { name: undefined },
    { slug: undefined },
    { name: 'a'.repeat(81) },
    { description: 'a'.repeat(501) },
  ])('rechaza %j', async (data) => {
    await expect(
      new CategoryModel({ name: 'Café', slug: 'cafe', ...data }).validate(),
    ).rejects.toThrow();
  });
  it('acepta una categoría válida', async () => {
    const category = new CategoryModel({
      name: 'Café caliente',
      slug: 'cafe-caliente',
      sortOrder: 1,
    });

    await expect(category.validate()).resolves.toBeUndefined();
  });

  it('rechaza nombres demasiado cortos', async () => {
    const category = new CategoryModel({
      name: 'A',
      slug: 'categoria-valida',
    });

    await expect(category.validate()).rejects.toThrow();
  });

  it('rechaza slugs con espacios', async () => {
    const category = new CategoryModel({
      name: 'Café caliente',
      slug: 'cafe caliente',
    });

    await expect(category.validate()).rejects.toThrow();
  });

  it('rechaza un orden negativo', async () => {
    const category = new CategoryModel({
      name: 'Café caliente',
      slug: 'cafe-caliente',
      sortOrder: -1,
    });

    await expect(category.validate()).rejects.toThrow();
  });
});
