import { Pool } from "pg";
import { env } from "./env";

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: { rejectUnauthorized: false },
});

pool.on("error", (err: Error) => {
  console.error("Unexpected database pool error:", err.message);
});
