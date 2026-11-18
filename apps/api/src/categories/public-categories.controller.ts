import { Controller, Get, Inject, Query } from '@nestjs/common';
import { EmptyQueryDto } from '../common/empty-query.dto.js';
import { CategoriesService } from './categories.service.js';

@Controller('menu/categories')
export class PublicCategoriesController {
  constructor(
    @Inject(CategoriesService) private readonly categories: CategoriesService,
  ) {}

  @Get()
  list(@Query() _query: EmptyQueryDto) {
    return this.categories.listPublic();
  }
}
