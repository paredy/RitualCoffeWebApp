import { Injectable, type OnModuleInit } from '@nestjs/common';
import { hash, verify } from '@node-rs/argon2';
import { randomBytes } from 'node:crypto';

@Injectable()
export class PasswordService implements OnModuleInit {
  private dummyHash!: string;

  async onModuleInit(): Promise<void> {
    this.dummyHash = await this.hash(randomBytes(32).toString('base64url'));
  }

  hash(password: string): Promise<string> {
    // Argon2id = 2 in the library API (its ambient const enum is incompatible with isolatedModules).
    return hash(password, {
      algorithm: 2,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
      outputLen: 32,
    });
  }

  async verify(
    passwordHash: string | undefined,
    password: string,
  ): Promise<boolean> {
    // Unknown users also pay the password-verification cost.
    if (!passwordHash?.startsWith('$argon2id$')) {
      await verify(this.dummyHash, password);
      return false;
    }
    try {
      return await verify(passwordHash, password);
    } catch {
      await verify(this.dummyHash, password);
      return false;
    }
  }
}
