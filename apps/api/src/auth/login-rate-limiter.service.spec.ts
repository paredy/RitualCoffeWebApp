import { HttpException } from '@nestjs/common';
import { LoginRateLimiter } from './login-rate-limiter.service.js';

describe('LoginRateLimiter', () => {
  afterEach(() => {
    vi.useRealTimers();
  });
  it('limita por IP aunque cambie el username', () => {
    const limiter = new LoginRateLimiter();
    for (let i = 0; i < 10; i++) limiter.consume('192.0.2.1', `user-${i}`);
    expect(() => limiter.consume('192.0.2.1', 'another')).toThrow(
      HttpException,
    );
    expect(() => limiter.consume('192.0.2.2', 'another')).not.toThrow();
  });
  it('limita por username aunque cambie la IP', () => {
    const limiter = new LoginRateLimiter();
    for (let i = 0; i < 20; i++) limiter.consume(`192.0.2.${i}`, 'target');
    expect(() => limiter.consume('192.0.2.100', 'target')).toThrow(
      HttpException,
    );
  });
  it('libera los límites al vencer las ventanas', () => {
    vi.useFakeTimers();
    const limiter = new LoginRateLimiter();
    for (let i = 0; i < 10; i++) limiter.consume('192.0.2.1', 'user');
    vi.advanceTimersByTime(60001);
    expect(() => limiter.consume('192.0.2.1', 'user')).not.toThrow();
    vi.advanceTimersByTime(900001);
    for (let i = 0; i < 10; i++)
      expect(() => limiter.consume('192.0.2.1', 'user')).not.toThrow();
  });
});
