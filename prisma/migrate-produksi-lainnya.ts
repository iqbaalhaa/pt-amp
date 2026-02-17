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
    `
    CREATE TABLE IF NOT EXISTS "produksi_lainnya" (
      "id"           BIGSERIAL PRIMARY KEY,
      "date"         DATE NOT NULL,
      "petugas"      TEXT,
      "notes"        TEXT,
      "total_biaya"  NUMERIC(14, 2)
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS "produksi_lainnya_items" (
      "id"                  BIGSERIAL PRIMARY KEY,
      "produksi_lainnya_id" BIGINT NOT NULL,
      "nama_pekerja"        TEXT NOT NULL,
      "nama_pekerjaan"      TEXT NOT NULL,
      "upah"                NUMERIC(14, 2) NOT NULL,
      "qty"                 NUMERIC(14, 4) NOT NULL,
      "satuan"              TEXT NOT NULL,
      "total"               NUMERIC(14, 2) NOT NULL,
      CONSTRAINT "produksi_lainnya_items_produksi_lainnya_id_fkey"
        FOREIGN KEY ("produksi_lainnya_id")
        REFERENCES "produksi_lainnya"("id")
        ON DELETE CASCADE
    );
    `,
    `
    CREATE INDEX IF NOT EXISTS "idx_produksi_lainnya_items_produksi_lainnya_id"
      ON "produksi_lainnya_items" ("produksi_lainnya_id");
    `,
  ];

  try {
    for (const q of queries) {
      console.log(q.trim());
      await pool.query(q);
    }
    console.log("Produksi Lainnya migration completed");
  } catch (e) {
    console.error("Failed to run Produksi Lainnya migration:", e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

