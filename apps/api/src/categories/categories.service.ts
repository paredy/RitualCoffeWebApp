import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { Category } from './schemas/category.schema.js';
import {
  toPublicCategory,
  type PublicCategoryRecord,
  type PublicCategoryResponseDto,
} from './dto/public-category-response.dto.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private readonly categories: Model<Category>,
  ) {}

  async listPublic(): Promise<{ data: PublicCategoryResponseDto[] }> {
    const categories = await this.categories
      .find({ isActive: true })
      .select({ name: 1, slug: 1, description: 1, imageUrl: 1 })
      .sort({ sortOrder: 1, _id: 1 })
      .lean<PublicCategoryRecord[]>()
      .exec();
    return { data: categories.map(toPublicCategory) };
  }
}
