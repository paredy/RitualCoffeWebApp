import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module.js';
import { Session, SessionSchema } from './schemas/session.schema.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthSettings } from './auth-settings.service.js';
import { PasswordService } from './password.service.js';
import { LoginRateLimiter } from './login-rate-limiter.service.js';
import { AuthOriginGuard } from './guards/auth-origin.guard.js';
import { SessionAuthGuard } from './guards/session-auth.guard.js';
import { CsrfGuard } from './guards/csrf.guard.js';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthSettings,
    PasswordService,
    LoginRateLimiter,
    AuthOriginGuard,
    SessionAuthGuard,
    CsrfGuard,
  ],
  exports: [
    AuthService,
    AuthSettings,
    SessionAuthGuard,
    AuthOriginGuard,
    CsrfGuard,
    MongooseModule,
  ],
})
export class AuthModule {}
