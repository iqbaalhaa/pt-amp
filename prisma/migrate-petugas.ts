import "dotenv/config";
import { Pool } from "pg";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });

  const queries = [
    `ALTER TABLE IF EXISTS "pengikisan" ADD COLUMN IF NOT EXISTS "petugas" text;`,
    `ALTER TABLE IF EXISTS "pemotongan" ADD COLUMN IF NOT EXISTS "petugas" text;`,
    `ALTER TABLE IF EXISTS "pengemasan" ADD COLUMN IF NOT EXISTS "petugas" text;`,
    `ALTER TABLE IF EXISTS "produksi_lainnya" ADD COLUMN IF NOT EXISTS "petugas" text;`,
  ];

  try {
    for (const q of queries) {
      console.log(q);
      await pool.query(q);
    }
    console.log("Petugas columns migration completed");
  } catch (e) {
    console.error("Failed to run petugas migration:", e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
