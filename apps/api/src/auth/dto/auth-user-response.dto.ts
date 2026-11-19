import type { UserDocument } from '../../users/schemas/user.schema.js';

export interface AuthUserResponseDto {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'barista';
}
export interface AuthResponseDto {
  data: AuthUserResponseDto;
  csrfToken: string;
}
export function toAuthUser(user: UserDocument): AuthUserResponseDto {
  return {
    id: user._id.toHexString(),
    name: user.name,
    username: user.username,
    role: user.role,
  };
}
