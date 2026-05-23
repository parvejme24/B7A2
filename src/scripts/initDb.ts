import { pool } from "../config/database";

const initSql = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'contributor'
    CHECK (role IN ('contributor', 'maintainer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS issues (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL
    CHECK (type IN ('bug', 'feature_request')),
  status VARCHAR(50) NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'resolved')),
  reporter_id INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

async function initDb(): Promise<void> {
  try {
    await pool.query(initSql);
    console.log("Database tables initialized successfully");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Database initialization failed:", message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDb();
