/*
  Warnings:

  - You are about to drop the column `supplier_id` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `customer_id` on the `sales` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "purchases" DROP COLUMN "supplier_id",
ADD COLUMN     "supplier" TEXT;

-- AlterTable
ALTER TABLE "sales" DROP COLUMN "customer_id",
ADD COLUMN     "customer" TEXT;
