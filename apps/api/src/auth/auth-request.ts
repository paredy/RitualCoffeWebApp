import type { FastifyRequest } from 'fastify';
import type { AuthResponseDto } from './dto/auth-user-response.dto.js';

export interface AuthenticatedRequest extends FastifyRequest {
  auth: AuthResponseDto;
  sessionToken: string;
}
