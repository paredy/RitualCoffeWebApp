import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { createHash, createHmac, randomBytes } from 'node:crypto';
import { User } from '../users/schemas/user.schema.js';
import { Session } from './schemas/session.schema.js';
import { SESSION_TOKEN_PATTERN } from './auth.constants.js';
import { AuthSettings } from './auth-settings.service.js';
import { PasswordService } from './password.service.js';
import { LoginRateLimiter } from './login-rate-limiter.service.js';
import {
  toAuthUser,
  type AuthResponseDto,
} from './dto/auth-user-response.dto.js';

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
export function csrfForSession(token: string): string {
  return createHmac('sha256', token)
    .update('ritual-coffee-csrf-v1')
    .digest('base64url');
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly users: Model<User>,
    @InjectModel(Session.name) private readonly sessions: Model<Session>,
    @Inject(PasswordService) private readonly passwords: PasswordService,
    @Inject(AuthSettings) private readonly settings: AuthSettings,
    @Inject(LoginRateLimiter) private readonly rateLimiter: LoginRateLimiter,
  ) {}

  async login(
    username: string,
    password: string,
    ip: string,
    previousToken?: string,
  ): Promise<{ token: string; response: AuthResponseDto }> {
    this.rateLimiter.consume(ip, username);
    const user = await this.users
      .findOne({ username })
      .select('+passwordHash')
      .exec();
    const valid = await this.passwords.verify(user?.passwordHash, password);
    if (!valid || !user || !user.isActive)
      throw new UnauthorizedException('Credenciales inválidas');
    const currentUser = await this.users
      .findOneAndUpdate(
        { _id: user._id, isActive: true },
        { $set: { lastLoginAt: new Date() } },
        { returnDocument: 'after' },
      )
      .exec();
    if (!currentUser) throw new UnauthorizedException('Credenciales inválidas');
    const token = randomBytes(32).toString('base64url');
    const tokenHash = hashSessionToken(token);
    await this.sessions.create({
      tokenHash,
      userId: user._id,
      expiresAt: new Date(Date.now() + this.settings.sessionTtlSeconds * 1000),
    });
    try {
      if (previousToken && SESSION_TOKEN_PATTERN.test(previousToken))
        await this.revoke(previousToken);
    } catch (error) {
      await this.sessions.deleteOne({ tokenHash }).exec();
      throw error;
    }
    return {
      token,
      response: {
        data: toAuthUser(currentUser),
        csrfToken: csrfForSession(token),
      },
    };
  }

  async authenticate(token: string | undefined): Promise<AuthResponseDto> {
    if (!token || !SESSION_TOKEN_PATTERN.test(token))
      throw new UnauthorizedException('Sesión no válida');
    const tokenHash = hashSessionToken(token);
    const session = await this.sessions
      .findOne({ tokenHash, expiresAt: { $gt: new Date() } })
      .exec();
    if (!session) throw new UnauthorizedException('Sesión no válida');
    // Read the current role/status on every request instead of trusting stale cookie claims.
    const user = await this.users
      .findOne({ _id: session.userId, isActive: true })
      .exec();
    if (!user) {
      await this.sessions.deleteOne({ tokenHash }).exec();
      throw new UnauthorizedException('Sesión no válida');
    }
    return { data: toAuthUser(user), csrfToken: csrfForSession(token) };
  }

  async revoke(token: string): Promise<void> {
    await this.sessions
      .deleteOne({ tokenHash: hashSessionToken(token) })
      .exec();
  }
}
