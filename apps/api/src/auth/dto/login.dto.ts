import { Transform } from 'class-transformer';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { USERNAME_PATTERN } from '../../users/username.constants.js';

export class LoginDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @Matches(USERNAME_PATTERN)
  username!: string;

  // Never trim or normalize passwords. Login accepts older passwords too.
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string;
}
