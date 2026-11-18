import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CategoriesModule } from './categories/categories.module.js';
import { ProductsModule } from './products/products.module.js';
import { UsersModule } from './users/users.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { InvoicesModule } from './invoices/invoices.module.js';
import { AuditLogsModule } from './audit-logs/audit-logs.module.js';
import { CoffeeTypesModule } from './coffee-types/coffee-types.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/api/.env', '.env'],
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const user = config.getOrThrow<string>('MONGO_USER');
        const password = config.getOrThrow<string>('MONGO_PASSWORD');
        const host = config.getOrThrow<string>('MONGO_HOST');
        const port = config.getOrThrow<string>('MONGO_PORT');
        const database = config.getOrThrow<string>('MONGO_DATABASE');

        const uri =
          `mongodb://${encodeURIComponent(user)}:` +
          `${encodeURIComponent(password)}@${host}:${port}/` +
          `${database}?authSource=${database}`;

        return { uri };
      },
    }),

    CategoriesModule,

    ProductsModule,
    UsersModule,
    OrdersModule,
    InvoicesModule,
    AuditLogsModule,
    CoffeeTypesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
