import type { Types } from 'mongoose';
import type { Category } from '../../categories/schemas/category.schema.js';
import { moneyToString } from '../../common/schema-validation.js';
import type { Product } from '../schemas/product.schema.js';

export type PublicProductRecord = Pick<
  Product,
  | 'name'
  | 'slug'
  | 'description'
  | 'pricingType'
  | 'price'
  | 'variants'
  | 'extras'
  | 'imageUrl'
  | 'isAvailable'
> & {
  _id: Types.ObjectId;
  category: Pick<Category, 'name' | 'slug'> & { _id: Types.ObjectId };
};

export interface PublicProductResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: { id: string; name: string; slug: string };
  pricingType: 'fixed' | 'variant';
  price: string | null;
  currency: 'USD';
  imageUrl: string | null;
  isAvailable: boolean;
  variants: Array<{
    code: string;
    name: string;
    price: string;
    isAvailable: boolean;
  }>;
  extras: Array<{
    code: string;
    name: string;
    price: string;
    isAvailable: boolean;
    maxQuantity: number;
  }>;
}

export interface PublicProductListResponseDto {
  data: PublicProductResponseDto[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export function toPublicProduct(
  product: PublicProductRecord,
): PublicProductResponseDto {
  return {
    id: product._id.toHexString(),
    name: product.name,
    slug: product.slug,
    description: product.description,
    category: {
      id: product.category._id.toHexString(),
      name: product.category.name,
      slug: product.category.slug,
    },
    pricingType: product.pricingType,
    price: product.price === null ? null : moneyToString(product.price),
    currency: 'USD',
    imageUrl: product.imageUrl,
    isAvailable: product.isAvailable,
    variants: product.variants
      .filter((variant) => variant.isAvailable === true)
      .sort(
        (left, right) =>
          left.sortOrder - right.sortOrder ||
          left.code.localeCompare(right.code, 'en'),
      )
      .map((variant) => ({
        code: variant.code,
        name: variant.name,
        price: moneyToString(variant.price),
        isAvailable: variant.isAvailable,
      })),
    extras: product.extras
      .filter((extra) => extra.isAvailable === true)
      .map((extra) => ({
        code: extra.code,
        name: extra.name,
        price: moneyToString(extra.price),
        isAvailable: extra.isAvailable,
        maxQuantity: extra.maxQuantity,
      })),
  };
}
