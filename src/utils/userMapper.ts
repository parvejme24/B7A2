import { UserRow, UserPublic } from "../types";

export function toPublicUser(user: UserRow): UserPublic {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}
