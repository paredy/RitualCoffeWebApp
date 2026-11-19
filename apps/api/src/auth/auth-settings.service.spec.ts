import { ConfigService } from '@nestjs/config';
import { AuthSettings } from './auth-settings.service.js';

function settings(values: Record<string, unknown> = {}) {
  const config = {
    get: (key: string) => values[key],
  } as unknown as ConfigService;
  return new AuthSettings(config);
}
describe('AuthSettings', () => {
  it('permite desarrollo local con cookie HttpOnly y ocho horas de sesión', () => {
    const config = settings();
    expect(config.sessionTtlSeconds).toBe(28800);
    expect(config.cookieName).toBe('ritual_session');
    expect(config.allowedOrigins).toContain('http://localhost:5173');
    expect(config.cookieOptions()).toEqual({
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
  });
  it('exige HTTPS y cookie __Host- en producción', () => {
    const config = settings({
      NODE_ENV: 'production',
      AUTH_ALLOWED_ORIGINS: 'https://coffee.example',
    });
    expect(config.cookieName).toBe('__Host-ritual_session');
    expect(config.cookieOptions().secure).toBe(true);
  });
  it.each([
    { NODE_ENV: 'production' },
    { NODE_ENV: 'production', AUTH_ALLOWED_ORIGINS: 'http://coffee.example' },
    { AUTH_ALLOWED_ORIGINS: '*' },
    { AUTH_ALLOWED_ORIGINS: 'https://coffee.example/' },
    { AUTH_ALLOWED_ORIGINS: 'https://user:password@coffee.example' },
    { AUTH_SESSION_TTL_SECONDS: '0' },
    { AUTH_SESSION_TTL_SECONDS: '86401' },
    { AUTH_SESSION_TTL_SECONDS: '1.5' },
    { AUTH_SESSION_TTL_SECONDS: 'NaN' },
  ])('rechaza configuración insegura o inválida %j', (values) => {
    expect(() => settings(values)).toThrow();
  });
});
