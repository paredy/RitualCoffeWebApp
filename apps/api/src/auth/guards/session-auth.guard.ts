import {
  Inject,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { AuthService } from '../auth.service.js';
import { AuthSettings } from '../auth-settings.service.js';
import type { AuthenticatedRequest } from '../auth-request.js';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(AuthSettings) private readonly settings: AuthSettings,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const reply = context.switchToHttp().getResponse<FastifyReply>();
    reply.header('Cache-Control', 'no-store');
    const token = request.cookies[this.settings.cookieName];
    try {
      request.auth = await this.auth.authenticate(token);
      request.sessionToken = token!;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException)
        reply.clearCookie(
          this.settings.cookieName,
          this.settings.cookieOptions(),
        );
      throw error;
    }
  }
}
