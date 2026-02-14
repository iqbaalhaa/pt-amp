-- CreateTable
CREATE TABLE "pengemasan" (
    "id" BIGSERIAL NOT NULL,
    "date" DATE NOT NULL,
    "notes" TEXT,
    "total_upah" DECIMAL(14,2),
    "upah_per_bungkus" DECIMAL(14,2),

    CONSTRAINT "pengemasan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengemasan_items" (
    "id" BIGSERIAL NOT NULL,
    "pengemasan_id" BIGINT NOT NULL,
    "nama" TEXT NOT NULL,
    "bungkus" DECIMAL(10,2) NOT NULL,
    "upah_per_bungkus" DECIMAL(14,2) NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "pengemasan_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pengemasan_items" ADD CONSTRAINT "pengemasan_items_pengemasan_id_fkey" FOREIGN KEY ("pengemasan_id") REFERENCES "pengemasan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
