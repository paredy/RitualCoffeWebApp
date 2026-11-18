import { IsString, Matches } from 'class-validator';
import { CODE_PATTERN } from '../../common/schema-validation.js';

export class PublicProductSlugDto {
  @IsString()
  @Matches(CODE_PATTERN)
  slug!: string;
}
