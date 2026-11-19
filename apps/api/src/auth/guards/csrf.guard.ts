import {
  ForbiddenException,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import type { AuthenticatedRequest } from '../auth-request.js';
import { SESSION_TOKEN_PATTERN } from '../auth.constants.js';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const supplied = request.headers['x-csrf-token'];
    if (
      typeof supplied !== 'string' ||
      !SESSION_TOKEN_PATTERN.test(supplied) ||
      !timingSafeEqual(
        Buffer.from(supplied),
        Buffer.from(request.auth.csrfToken),
      )
    ) {
      throw new ForbiddenException('Token CSRF no válido');
    }
    return true;
  }
}
