import 'reflect-metadata';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ListPublicProductsQueryDto } from './list-public-products-query.dto.js';

const pipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
});
const metadata = {
  type: 'query' as const,
  metatype: ListPublicProductsQueryDto,
};

describe('ListPublicProductsQueryDto', () => {
  it('aplica los valores predeterminados', async () => {
    await expect(pipe.transform({}, metadata)).resolves.toEqual({
      page: 1,
      limit: 20,
    });
  });
  it('acepta parámetros válidos y transforma enteros', async () => {
    await expect(
      pipe.transform(
        { category: 'cafes-calientes', page: '2', limit: '50' },
        metadata,
      ),
    ).resolves.toEqual({ category: 'cafes-calientes', page: 2, limit: 50 });
  });
  it.each([
    { page: '0' },
    { page: '-1' },
    { page: '1.5' },
    { page: '' },
    { page: '1e2' },
    { page: 'Infinity' },
    { page: ['1', '2'] },
    { page: '9007199254740992' },
    { limit: '0' },
    { limit: '51' },
    { limit: '2.5' },
    { limit: ['1', '2'] },
    { category: 'bad slug' },
    { category: '' },
    { category: ['cafes', 'postres'] },
    { category: { $ne: null } },
    { isVisible: 'false' },
    { includeArchived: 'true' },
  ])('rechaza %j', async (query) => {
    await expect(pipe.transform(query, metadata)).rejects.toThrow(
      BadRequestException,
    );
  });
});
