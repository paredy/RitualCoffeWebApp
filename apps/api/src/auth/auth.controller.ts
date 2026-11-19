import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { EmptyQueryDto } from '../common/empty-query.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { AuthService } from './auth.service.js';
import { AuthSettings } from './auth-settings.service.js';
import { AuthOriginGuard } from './guards/auth-origin.guard.js';
import { SessionAuthGuard } from './guards/session-auth.guard.js';
import { CsrfGuard } from './guards/csrf.guard.js';
import type { AuthenticatedRequest } from './auth-request.js';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(AuthSettings) private readonly settings: AuthSettings,
  ) {}

  @Post('login')
  @HttpCode(200)
  @UseGuards(AuthOriginGuard)
  async login(
    @Body() body: LoginDto,
    @Query() _query: EmptyQueryDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.auth.login(
      body.username,
      body.password,
      request.ip,
      request.cookies[this.settings.cookieName],
    );
    reply.setCookie(this.settings.cookieName, result.token, {
      ...this.settings.cookieOptions(),
      maxAge: this.settings.sessionTtlSeconds,
      expires: new Date(Date.now() + this.settings.sessionTtlSeconds * 1000),
    });
    return result.response;
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  me(@Req() request: AuthenticatedRequest, @Query() _query: EmptyQueryDto) {
    return request.auth;
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(AuthOriginGuard, SessionAuthGuard, CsrfGuard)
  async logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Query() _query: EmptyQueryDto,
    @Body() _body: EmptyQueryDto,
  ) {
    await this.auth.revoke(request.sessionToken);
    reply.clearCookie(this.settings.cookieName, this.settings.cookieOptions());
  }
}
