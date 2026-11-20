import {
  Body,
  Controller,
  Delete,
  Inject,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ProductsService } from './products.service.js';

@Controller('barista/products')
export class BaristaProductsController {
  constructor(
    @Inject(ProductsService) private readonly products: ProductsService,
  ) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @Patch(':id/toggle-availability')
  toggleAvailability(@Param('id') id: string) {
    return this.products.toggleAvailability(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.products.delete(id);
  }
}
