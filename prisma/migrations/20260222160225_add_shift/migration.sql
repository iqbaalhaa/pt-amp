-- CreateEnum
CREATE TYPE "Shift" AS ENUM ('siang', 'malam');

-- AlterTable
ALTER TABLE "pemotongan" ADD COLUMN     "shift" "Shift" NOT NULL DEFAULT 'siang';

-- AlterTable
ALTER TABLE "pengemasan" ADD COLUMN     "shift" "Shift" NOT NULL DEFAULT 'siang';

-- AlterTable
ALTER TABLE "pengikisan" ADD COLUMN     "shift" "Shift" NOT NULL DEFAULT 'siang';
