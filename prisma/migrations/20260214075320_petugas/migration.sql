-- AlterTable
ALTER TABLE "purchases" ADD COLUMN     "created_by_id" TEXT,
ADD COLUMN     "created_by_name" TEXT;

-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "created_by_id" TEXT,
ADD COLUMN     "created_by_name" TEXT;
