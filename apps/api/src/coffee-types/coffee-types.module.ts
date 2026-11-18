import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoffeeType, CoffeeTypeSchema } from './schemas/coffee-type.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CoffeeType.name, schema: CoffeeTypeSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class CoffeeTypesModule {}
