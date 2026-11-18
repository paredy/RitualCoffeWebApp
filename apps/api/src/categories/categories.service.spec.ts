import { Types, type Model } from 'mongoose';
import { CategoriesService } from './categories.service.js';
import type { Category } from './schemas/category.schema.js';

describe('CategoriesService', () => {
  it('devuelve una lista vacía si no hay categorías activas', async () => {
    const query = {
      select: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([]),
    };
    const model = { find: vi.fn().mockReturnValue(query) };
    const service = new CategoriesService(model as unknown as Model<Category>);
    await expect(service.listPublic()).resolves.toEqual({ data: [] });
  });

  it('expone únicamente los campos públicos aunque MongoDB devuelva campos adicionales', async () => {
    const id = new Types.ObjectId();
    const query = {
      select: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockReturnThis(),
      exec: vi
        .fn()
        .mockResolvedValue([
          {
            _id: id,
            name: 'Cafés',
            slug: 'cafes',
            description: '',
            imageUrl: null,
            isActive: true,
            internalNote: 'privado',
            createdAt: new Date(),
          },
        ]),
    };
    const service = new CategoriesService({
      find: () => query,
    } as unknown as Model<Category>);
    await expect(service.listPublic()).resolves.toEqual({
      data: [
        {
          id: id.toHexString(),
          name: 'Cafés',
          slug: 'cafes',
          description: '',
          imageUrl: null,
        },
      ],
    });
  });
});
