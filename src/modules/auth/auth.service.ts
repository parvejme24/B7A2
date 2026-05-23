import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../../config/database";
import { env } from "../../config/env";
import { JwtPayload, LoginBody, SignupBody, UserRow } from "../../types";
import { BadRequestError, UnauthorizedError } from "../../utils/errors";
import { toPublicUser } from "../../utils/userMapper";

export async function registerUser(input: SignupBody) {
  const existing = await pool.query<{ id: number }>(
    "SELECT id FROM users WHERE email = $1",
    [input.email]
  );

  if (existing.rows.length > 0) {
    throw new BadRequestError("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(input.password, env.bcryptSaltRounds);

  const result = await pool.query<UserRow>(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [input.name, input.email, hashedPassword, input.role]
  );

  const user = result.rows[0];
  return toPublicUser({ ...user, password: "" });
}

export async function loginUser(input: LoginBody) {
  const result = await pool.query<UserRow>(
    "SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE email = $1",
    [input.email]
  );

  if (result.rows.length === 0) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const user = result.rows[0];
  const passwordMatch = await bcrypt.compare(input.password, user.password);

  if (!passwordMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const payload: JwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  const token = jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });

  return {
    token,
    user: toPublicUser(user),
  };
}
