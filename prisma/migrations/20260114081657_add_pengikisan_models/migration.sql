-- CreateTable
CREATE TABLE "pengikisan" (
    "id" BIGSERIAL NOT NULL,
    "date" DATE NOT NULL,
    "notes" TEXT,
    "total_upah" DECIMAL(14,2),

    CONSTRAINT "pengikisan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengikisan_items" (
    "id" BIGSERIAL NOT NULL,
    "pengikisan_id" BIGINT NOT NULL,
    "nama" TEXT NOT NULL,
    "ka_kg" DECIMAL(14,4) NOT NULL,
    "stik_kg" DECIMAL(14,4) NOT NULL,
    "upah_ka" DECIMAL(14,2) NOT NULL,
    "upah_stik" DECIMAL(14,2) NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "pengikisan_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pengikisan_items" ADD CONSTRAINT "pengikisan_items_pengikisan_id_fkey" FOREIGN KEY ("pengikisan_id") REFERENCES "pengikisan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
