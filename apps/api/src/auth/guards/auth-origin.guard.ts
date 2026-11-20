import {
  ForbiddenException,
  Inject,
  Injectable,
  UnsupportedMediaTypeException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthSettings } from '../auth-settings.service.js';

@Injectable()
export class AuthOriginGuard implements CanActivate {
  constructor(@Inject(AuthSettings) private readonly settings: AuthSettings) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    context
      .switchToHttp()
      .getResponse<FastifyReply>()
      .header('Cache-Control', 'no-store');
    // Required even on login: protects against login-CSRF. Non-browser clients send Origin too.
    if (
      !request.headers.origin ||
      !this.settings.allowedOrigins.includes(request.headers.origin)
    ) {
      throw new ForbiddenException('Origen no permitido');
    }
    const contentType = request.headers['content-type'];
    if (
      contentType &&
      contentType.split(';')[0].trim().toLowerCase() !== 'application/json'
    ) {
      throw new UnsupportedMediaTypeException('Utiliza application/json');
    }
    return true;
  }
}
