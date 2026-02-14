-- Create table: suppliers
CREATE TABLE IF NOT EXISTS "suppliers" (
  "id" BIGSERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "address" TEXT NULL,
  "phone" TEXT NULL,
  "bank_account" TEXT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Ensure unique constraint on name (redundant if defined above, kept for clarity)
ALTER TABLE "suppliers"
  ADD CONSTRAINT suppliers_name_unique UNIQUE ("name");

-- Optional: simple trigger to update updated_at automatically on row update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'suppliers_set_updated_at'
  ) THEN
    CREATE OR REPLACE FUNCTION suppliers_set_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW."updated_at" := NOW();
      RETURN NEW;
    END
    $func$ LANGUAGE plpgsql;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'suppliers_updated_at_trigger'
  ) THEN
    CREATE TRIGGER suppliers_updated_at_trigger
    BEFORE UPDATE ON "suppliers"
    FOR EACH ROW EXECUTE PROCEDURE suppliers_set_updated_at();
  END IF;
END$$;
