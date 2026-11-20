import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  roastLevel?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tastingNotes?: string[];

  @IsOptional()
  @IsString()
  extractionMethod?: string;

  @IsOptional()
  @IsString()
  temperature?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsBoolean()
  isSpecialty?: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
