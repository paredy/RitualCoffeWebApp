import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesModule } from '../categories/categories.module.js';
import { ProductsService } from './products.service.js';
import { PublicProductsController } from './public-products.controller.js';
import { BaristaProductsController } from './barista-products.controller.js';
import { Product, ProductSchema } from './schemas/product.schema.js';

@Module({
  imports: [
    CategoriesModule,
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
    ]),
  ],
  controllers: [PublicProductsController, BaristaProductsController],
  providers: [ProductsService],
  exports: [MongooseModule],
})
export class ProductsModule {}
