import { ValidationPipe, type INestApplication } from '@nestjs/common';

// Shared by the real bootstrap and e2e tests so validation behaves identically.
export function configureHttpApp(app: INestApplication): void {
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: false,
    }),
  );
}
