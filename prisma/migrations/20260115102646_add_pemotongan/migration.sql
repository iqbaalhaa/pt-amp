-- CreateTable
CREATE TABLE "pemotongan" (
    "id" BIGSERIAL NOT NULL,
    "date" DATE NOT NULL,
    "notes" TEXT,
    "total_upah" DECIMAL(14,2),
    "upah_per_kg" DECIMAL(14,2),

    CONSTRAINT "pemotongan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pemotongan_items" (
    "id" BIGSERIAL NOT NULL,
    "pemotongan_id" BIGINT NOT NULL,
    "nama" TEXT NOT NULL,
    "qty" DECIMAL(14,4) NOT NULL,
    "upah_per_kg" DECIMAL(14,2) NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "pemotongan_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pemotongan_items" ADD CONSTRAINT "pemotongan_items_pemotongan_id_fkey" FOREIGN KEY ("pemotongan_id") REFERENCES "pemotongan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
