import dotenv from "dotenv";

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT ?? "3000", 10),
  databaseUrl: requireEnv("DATABASE_URL"),
  jwtSecret: requireEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  bcryptSaltRounds: Math.min(
    12,
    Math.max(8, parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "10", 10))
  ),
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
};
