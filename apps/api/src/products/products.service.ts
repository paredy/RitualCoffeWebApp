import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, type Model, type PipelineStage } from 'mongoose';
import { Category } from '../categories/schemas/category.schema.js';
import { Product } from './schemas/product.schema.js';
import type { ListPublicProductsQueryDto } from './dto/list-public-products-query.dto.js';
import type { CreateProductDto } from './dto/create-product.dto.js';
import type { UpdateProductDto } from './dto/update-product.dto.js';
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

  async create(dto: CreateProductDto): Promise<{ data: PublicProductResponseDto }> {
    let categoryDoc = null;
    if (Types.ObjectId.isValid(dto.category)) {
      categoryDoc = await this.categories.findById(dto.category).exec();
    }
    if (!categoryDoc) {
      categoryDoc = await this.categories.findOne({ slug: dto.category }).exec();
    }
    if (!categoryDoc) {
      throw new BadRequestException(`Categoría no válida: ${dto.category}`);
    }

    const baseSlug = dto.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'producto';

    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await this.products.exists({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }

    const highestSort = await this.products
      .findOne()
      .sort({ sortOrder: -1 })
      .select({ sortOrder: 1 })
      .lean()
      .exec();
    const sortOrder = (highestSort?.sortOrder ?? 0) + 1;

    const created = await this.products.create({
      name: dto.name.trim(),
      slug: uniqueSlug,
      description: dto.description?.trim() ?? '',
      categoryId: categoryDoc._id,
      pricingType: 'fixed',
      price: Types.Decimal128.fromString(Number(dto.price).toFixed(2)),
      variants: [],
      extras: [],
      imageUrl: dto.imageUrl?.trim() || null,
      origin: dto.origin?.trim() || null,
      roastLevel: dto.roastLevel?.trim() || null,
      tastingNotes: dto.tastingNotes ?? [],
      extractionMethod: dto.extractionMethod?.trim() || null,
      temperature: dto.temperature?.trim() || null,
      allergens: dto.allergens ?? [],
      isSpecialty: dto.isSpecialty ?? false,
      isAvailable: dto.isAvailable ?? true,
      isVisible: true,
      isArchived: false,
      sortOrder,
    });

    return this.findPublicBySlug(created.slug);
  }

  async update(id: string, dto: UpdateProductDto): Promise<{ data: PublicProductResponseDto }> {
    const filter = Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
    const product = await this.products.findOne(filter).exec();
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (dto.category) {
      let categoryDoc = null;
      if (Types.ObjectId.isValid(dto.category)) {
        categoryDoc = await this.categories.findById(dto.category).exec();
      }
      if (!categoryDoc) {
        categoryDoc = await this.categories.findOne({ slug: dto.category }).exec();
      }
      if (categoryDoc) {
        product.categoryId = categoryDoc._id as Types.ObjectId;
      }
    }

    if (dto.name !== undefined) product.name = dto.name.trim();
    if (dto.description !== undefined) product.description = dto.description.trim();
    if (dto.price !== undefined) {
      product.price = Types.Decimal128.fromString(Number(dto.price).toFixed(2));
    }
    if (dto.imageUrl !== undefined) product.imageUrl = dto.imageUrl ? dto.imageUrl.trim() : null;
    if (dto.origin !== undefined) product.origin = dto.origin ? dto.origin.trim() : null;
    if (dto.roastLevel !== undefined) product.roastLevel = dto.roastLevel ? dto.roastLevel.trim() : null;
    if (dto.tastingNotes !== undefined) product.tastingNotes = dto.tastingNotes;
    if (dto.extractionMethod !== undefined) product.extractionMethod = dto.extractionMethod ? dto.extractionMethod.trim() : null;
    if (dto.temperature !== undefined) product.temperature = dto.temperature ? dto.temperature.trim() : null;
    if (dto.allergens !== undefined) product.allergens = dto.allergens;
    if (dto.isSpecialty !== undefined) product.isSpecialty = dto.isSpecialty;
    if (dto.isAvailable !== undefined) product.isAvailable = dto.isAvailable;

    await product.save();
    return this.findPublicBySlug(product.slug);
  }

  async toggleAvailability(id: string): Promise<{ data: PublicProductResponseDto }> {
    const filter = Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
    const product = await this.products.findOne(filter).exec();
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    product.isAvailable = !product.isAvailable;
    await product.save();
    return this.findPublicBySlug(product.slug);
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const filter = Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
    const result = await this.products.deleteOne(filter).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Producto no encontrado');
    }
    return { success: true };
  }
}
