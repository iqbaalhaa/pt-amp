-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "revoke_reason" TEXT,
ADD COLUMN     "revoked_at" TIMESTAMP(3),
ADD COLUMN     "revoked_by_id" TEXT,
ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'draft';
