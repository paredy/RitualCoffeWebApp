import type { Types } from 'mongoose';
import type { Category } from '../schemas/category.schema.js';

export interface PublicCategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
}

export type PublicCategoryRecord = Pick<
  Category,
  'name' | 'slug' | 'description' | 'imageUrl'
> & { _id: Types.ObjectId };

export function toPublicCategory(
  category: PublicCategoryRecord,
): PublicCategoryResponseDto {
  return {
    id: category._id.toHexString(),
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageUrl,
  };
}
