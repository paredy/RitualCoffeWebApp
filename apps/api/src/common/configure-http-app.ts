import { ValidationPipe } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import cookie from '@fastify/cookie';
import { AuthSettings } from '../auth/auth-settings.service.js';

// Shared by the real bootstrap and e2e tests so validation behaves identically.
export async function configureHttpApp(
  app: NestFastifyApplication,
): Promise<void> {
  await app.register(cookie);
  const settings = app.get(AuthSettings);
  app.enableCors({
    origin: (origin, callback) =>
      callback(
        null,
        origin === undefined || settings.allowedOrigins.includes(origin),
      ),
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
  });
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
