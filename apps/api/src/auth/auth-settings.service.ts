import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthSettings {
  readonly production: boolean;
  readonly allowedOrigins: string[];
  readonly sessionTtlSeconds: number;
  readonly cookieName: string;

  constructor(@Inject(ConfigService) config: ConfigService) {
    this.production = config.get<string>('NODE_ENV') === 'production';
    const configured = config.get<string>('AUTH_ALLOWED_ORIGINS');
    if (this.production && !configured)
      throw new Error('AUTH_ALLOWED_ORIGINS es obligatorio en producción');
    this.allowedOrigins = (
      configured ??
      'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000'
    )
      .split(',')
      .map((origin) => origin.trim());
    for (const origin of this.allowedOrigins) {
      const url = new URL(origin);
      if (
        url.origin !== origin ||
        url.username ||
        url.password ||
        !['http:', 'https:'].includes(url.protocol) ||
        (this.production && url.protocol !== 'https:')
      ) {
        throw new Error(
          'AUTH_ALLOWED_ORIGINS debe contener orígenes exactos; HTTPS en producción',
        );
      }
    }
    this.sessionTtlSeconds = Number(
      config.get<string>('AUTH_SESSION_TTL_SECONDS') ?? '28800',
    );
    if (
      !Number.isSafeInteger(this.sessionTtlSeconds) ||
      this.sessionTtlSeconds < 60 ||
      this.sessionTtlSeconds > 86400
    ) {
      throw new Error(
        'AUTH_SESSION_TTL_SECONDS debe ser un entero entre 60 y 86400',
      );
    }
    this.cookieName = this.production
      ? '__Host-ritual_session'
      : 'ritual_session';
  }

  cookieOptions() {
    return {
      path: '/',
      httpOnly: true,
      secure: this.production,
      sameSite: 'lax' as const,
    };
  }
}
