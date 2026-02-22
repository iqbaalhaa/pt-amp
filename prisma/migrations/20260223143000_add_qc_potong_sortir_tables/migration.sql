-- CreateTable
CREATE TABLE "qc_potong_sortir" (
    "id" BIGSERIAL NOT NULL,
    "date" DATE NOT NULL,
    "notes" TEXT,
    "total_upah" DECIMAL(14,2),
    "upah_per_hari" DECIMAL(14,2),
    "upah_lembur_per_jam" DECIMAL(14,2),

    CONSTRAINT "qc_potong_sortir_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qc_potong_sortir_items" (
    "id" BIGSERIAL NOT NULL,
    "qc_potong_sortir_id" BIGINT NOT NULL,
    "nama" TEXT NOT NULL,
    "hari" DECIMAL(10,2) NOT NULL,
    "lembur_jam" DECIMAL(10,2) NOT NULL,
    "upah_per_hari" DECIMAL(14,2) NOT NULL,
    "upah_lembur_per_jam" DECIMAL(14,2) NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "qc_potong_sortir_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "qc_potong_sortir_items" ADD CONSTRAINT "qc_potong_sortir_items_qc_potong_sortir_id_fkey" FOREIGN KEY ("qc_potong_sortir_id") REFERENCES "qc_potong_sortir"("id") ON DELETE CASCADE ON UPDATE CASCADE;

