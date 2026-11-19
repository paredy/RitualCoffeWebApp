import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';

interface Bucket {
  attempts: number;
  expiresAt: number;
}

@Injectable()
export class LoginRateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  // Bounded, per-process throttling for the current single-API deployment.
  consume(ip: string, username: string): void {
    const now = Date.now();
    for (const [key, bucket] of this.buckets)
      if (bucket.expiresAt <= now) this.buckets.delete(key);
    const policies = [
      { key: `ip:${ip}`, max: 10, window: 60000 },
      {
        key: `user:${createHash('sha256').update(username).digest('hex')}`,
        max: 20,
        window: 900000,
      },
    ];
    if (
      this.buckets.size +
        policies.filter((policy) => !this.buckets.has(policy.key)).length >
      10000
    ) {
      throw new HttpException(
        'Demasiados intentos. Intenta más tarde.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    for (const policy of policies) {
      const bucket = this.buckets.get(policy.key);
      if (
        (bucket && bucket.attempts >= policy.max) ||
        (!bucket && this.buckets.size >= 10000)
      ) {
        throw new HttpException(
          'Demasiados intentos. Intenta más tarde.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }
    for (const policy of policies) {
      const bucket = this.buckets.get(policy.key) ?? {
        attempts: 0,
        expiresAt: now + policy.window,
      };
      bucket.attempts += 1;
      this.buckets.set(policy.key, bucket);
    }
  }
}
