import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { CODE_PATTERN } from '../../common/schema-validation.js';

// Do not coerce arrays, empty strings, scientific notation or arbitrary objects to numbers.
function integerQuery(value: unknown): unknown {
  return typeof value === 'string' && /^\d+$/.test(value)
    ? Number(value)
    : value;
}

export class ListPublicProductsQueryDto {
  @IsOptional()
  @IsString()
  @Matches(CODE_PATTERN)
  category?: string;

  @Transform(({ value }: { value: unknown }) => integerQuery(value))
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  page: number = 1;

  @Transform(({ value }: { value: unknown }) => integerQuery(value))
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 20;
}
