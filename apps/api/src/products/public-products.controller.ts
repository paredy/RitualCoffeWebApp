import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { EmptyQueryDto } from '../common/empty-query.dto.js';
import { ListPublicProductsQueryDto } from './dto/list-public-products-query.dto.js';
import { PublicProductSlugDto } from './dto/public-product-slug.dto.js';
import { ProductsService } from './products.service.js';

@Controller('menu/products')
export class PublicProductsController {
  constructor(
    @Inject(ProductsService) private readonly products: ProductsService,
  ) {}

  @Get()
  list(@Query() query: ListPublicProductsQueryDto) {
    return this.products.listPublic(query);
  }

  @Get(':slug')
  detail(
    @Param() params: PublicProductSlugDto,
    @Query() _query: EmptyQueryDto,
  ) {
    return this.products.findPublicBySlug(params.slug);
  }
}
