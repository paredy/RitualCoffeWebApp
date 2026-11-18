import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesService } from './categories.service.js';
import { PublicCategoriesController } from './public-categories.controller.js';
import { Category, CategorySchema } from './schemas/category.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Category.name,
        schema: CategorySchema,
      },
    ]),
  ],
  controllers: [PublicCategoriesController],
  providers: [CategoriesService],
  exports: [MongooseModule],
})
export class CategoriesModule {}
