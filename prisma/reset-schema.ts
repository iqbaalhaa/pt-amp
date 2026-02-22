import "dotenv/config";
import { Pool } from "pg";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }
  const pool = new Pool({ connectionString });
  try {
    await pool.query("DROP SCHEMA IF EXISTS public CASCADE;");
    await pool.query("CREATE SCHEMA public;");
    console.log("Schema public dropped and recreated");
  } catch (e) {
    console.error("Failed to reset schema:", e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
