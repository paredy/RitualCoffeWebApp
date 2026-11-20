import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model, PipelineStage } from 'mongoose';
import { Category } from '../categories/schemas/category.schema.js';
import { Product } from './schemas/product.schema.js';
import type { ListPublicProductsQueryDto } from './dto/list-public-products-query.dto.js';
import {
  toPublicProduct,
  type PublicProductListResponseDto,
  type PublicProductRecord,
  type PublicProductResponseDto,
} from './dto/public-product-response.dto.js';

// Project explicitly; the response mapper is a second allowlist of public fields.
const publicProjection = {
  _id: 1,
  name: 1,
  slug: 1,
  description: 1,
  category: 1,
  pricingType: 1,
  price: 1,
  variants: 1,
  extras: 1,
  imageUrl: 1,
  isAvailable: 1,
  origin: 1,
  roastLevel: 1,
  tastingNotes: 1,
  extractionMethod: 1,
  temperature: 1,
  allergens: 1,
  isSpecialty: 1,
};
interface ProductPage {
  data: PublicProductRecord[];
  total: Array<{ count: number }>;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly products: Model<Product>,
    @InjectModel(Category.name) private readonly categories: Model<Category>,
  ) {}

  // Both endpoints share exactly the same publication rules, including the category lookup.
  private publicStages(category?: string, slug?: string): PipelineStage[] {
    return [
      {
        $match: {
          isVisible: true,
          isArchived: false,
          isAvailable: true,
          ...(slug === undefined ? {} : { slug }),
          $or: [
            { pricingType: 'fixed' },
            {
              pricingType: 'variant',
              variants: { $elemMatch: { isAvailable: true } },
            },
          ],
        },
      },
      {
        $lookup: {
          from: this.categories.collection.name,
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
          pipeline: [
            {
              $match: {
                isActive: true,
                ...(category === undefined ? {} : { slug: category }),
              },
            },
            { $project: { _id: 1, name: 1, slug: 1 } },
          ],
        },
      },
      { $unwind: '$category' },
    ];
  }

  async listPublic(
    query: ListPublicProductsQueryDto,
  ): Promise<PublicProductListResponseDto> {
    const { page, limit, category } = query;
    const skip = (page - 1) * limit;
    if (!Number.isSafeInteger(skip))
      throw new BadRequestException('La página solicitada está fuera de rango');
    // Count and pagination use the same filtered input, excluding all non-public products.
    const [result] = await this.products
      .aggregate<ProductPage>([
        ...this.publicStages(category),
        {
          $facet: {
            data: [
              { $sort: { sortOrder: 1, _id: 1 } },
              { $skip: skip },
              { $limit: limit },
              { $project: publicProjection },
            ],
            total: [{ $count: 'count' }],
          },
        },
      ])
      .exec();
    const total = result?.total[0]?.count ?? 0;
    return {
      data: (result?.data ?? []).map(toPublicProduct),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findPublicBySlug(
    slug: string,
  ): Promise<{ data: PublicProductResponseDto }> {
    const [product] = await this.products
      .aggregate<PublicProductRecord>([
        ...this.publicStages(undefined, slug),
        { $limit: 1 },
        { $project: publicProjection },
      ])
      .exec();
    if (!product) throw new NotFoundException('Producto no encontrado');
    return { data: toPublicProduct(product) };
  }
}
