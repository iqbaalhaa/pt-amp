/*
  Warnings:

  - You are about to drop the column `product_id` on the `production_inputs` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `production_outputs` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `purchase_items` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `sale_items` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `stock_movements` table. All the data in the column will be lost.
  - Added the required column `item_type_id` to the `production_inputs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item_type_id` to the `production_outputs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item_type_id` to the `purchase_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item_type_id` to the `sale_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item_type_id` to the `stock_movements` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "production_inputs" DROP CONSTRAINT "production_inputs_product_id_fkey";

-- DropForeignKey
ALTER TABLE "production_outputs" DROP CONSTRAINT "production_outputs_product_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_items" DROP CONSTRAINT "purchase_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "sale_items" DROP CONSTRAINT "sale_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_product_id_fkey";

-- DropIndex
DROP INDEX "idx_stock_movements_product";

-- AlterTable
ALTER TABLE "production_inputs" DROP COLUMN "product_id",
ADD COLUMN     "item_type_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "production_outputs" DROP COLUMN "product_id",
ADD COLUMN     "item_type_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "purchase_items" DROP COLUMN "product_id",
ADD COLUMN     "item_type_id" BIGINT NOT NULL,
ADD COLUMN     "unit_id" BIGINT;

-- AlterTable
ALTER TABLE "sale_items" DROP COLUMN "product_id",
ADD COLUMN     "item_type_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "stock_movements" DROP COLUMN "product_id",
ADD COLUMN     "item_type_id" BIGINT NOT NULL;

-- CreateTable
CREATE TABLE "item_types" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "item_types_name_key" ON "item_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "units_name_key" ON "units"("name");

-- CreateIndex
CREATE INDEX "idx_stock_movements_item_type" ON "stock_movements"("item_type_id");

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_item_type_id_fkey" FOREIGN KEY ("item_type_id") REFERENCES "item_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_item_type_id_fkey" FOREIGN KEY ("item_type_id") REFERENCES "item_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_inputs" ADD CONSTRAINT "production_inputs_item_type_id_fkey" FOREIGN KEY ("item_type_id") REFERENCES "item_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_outputs" ADD CONSTRAINT "production_outputs_item_type_id_fkey" FOREIGN KEY ("item_type_id") REFERENCES "item_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_item_type_id_fkey" FOREIGN KEY ("item_type_id") REFERENCES "item_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
