/*
  Warnings:

  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "item_types" ADD COLUMN IF NOT EXISTS "image" TEXT,
ADD COLUMN IF NOT EXISTS "is_public" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "type" "ProductType",
ADD COLUMN IF NOT EXISTS "unit" TEXT DEFAULT 'kg';

-- DropTable
DROP TABLE IF EXISTS "products";

-- CreateTable
CREATE TABLE IF NOT EXISTS "suppliers" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "bank_account" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "suppliers_name_key" ON "suppliers"("name");
