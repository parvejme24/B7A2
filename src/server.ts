import app from "./app";
import { env } from "./config/env";
import { pool } from "./config/database";

async function start(): Promise<void> {
  try {
    await pool.query("SELECT 1");
    console.log("Database connected successfully");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Database connection failed:", message);
    process.exit(1);
  }

  app.listen(env.port, () => {
    const baseUrl = `http://localhost:${env.port}`;
    console.log(`DevPulse server running at ${baseUrl}`);
    console.log(`Home: ${baseUrl}/`);
  });
}

if (!process.env.VERCEL) {
  start();
}

export default app;
