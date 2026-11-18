import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';
import { configureHttpApp } from './common/configure-http-app.js';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  configureHttpApp(app);

  // Puerto del backend
  const port = Number(process.env.PORT ?? 3000);

  await app.listen(port, '127.0.0.1');

  console.log(`Ritual Coffee API: http://localhost:${port}/api/v1`);
}

await bootstrap();
