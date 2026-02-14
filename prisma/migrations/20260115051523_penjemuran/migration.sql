-- AlterTable
ALTER TABLE "productions" ADD COLUMN     "revoke_reason" TEXT,
ADD COLUMN     "revoked_at" TIMESTAMP(3),
ADD COLUMN     "revoked_by_id" TEXT;

-- AlterTable
ALTER TABLE "purchases" ADD COLUMN     "revoke_reason" TEXT,
ADD COLUMN     "revoked_at" TIMESTAMP(3),
ADD COLUMN     "revoked_by_id" TEXT;

-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "revoke_reason" TEXT,
ADD COLUMN     "revoked_at" TIMESTAMP(3),
ADD COLUMN     "revoked_by_id" TEXT;

-- AlterTable
ALTER TABLE "stock_movements" ADD COLUMN     "conversion_rate_used" DECIMAL(14,6),
ADD COLUMN     "displayUnit" TEXT;

-- CreateTable
CREATE TABLE "penjemuran" (
    "id" BIGSERIAL NOT NULL,
    "date" DATE NOT NULL,
    "notes" TEXT,
    "total_upah" DECIMAL(14,2),
    "upah_per_hari" DECIMAL(14,2),
    "upah_lembur_per_jam" DECIMAL(14,2),

    CONSTRAINT "penjemuran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penjemuran_items" (
    "id" BIGSERIAL NOT NULL,
    "penjemuran_id" BIGINT NOT NULL,
    "nama" TEXT NOT NULL,
    "hari" DECIMAL(10,2) NOT NULL,
    "lembur_jam" DECIMAL(10,2) NOT NULL,
    "upah_per_hari" DECIMAL(14,2) NOT NULL,
    "upah_lembur_per_jam" DECIMAL(14,2) NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "penjemuran_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "penjemuran_items" ADD CONSTRAINT "penjemuran_items_penjemuran_id_fkey" FOREIGN KEY ("penjemuran_id") REFERENCES "penjemuran"("id") ON DELETE CASCADE ON UPDATE CASCADE;
