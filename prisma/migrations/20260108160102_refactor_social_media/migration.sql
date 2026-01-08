/*
  Warnings:

  - You are about to drop the column `facebook` on the `contact_info` table. All the data in the column will be lost.
  - You are about to drop the column `instagram` on the `contact_info` table. All the data in the column will be lost.
  - You are about to drop the column `linkedin` on the `contact_info` table. All the data in the column will be lost.
  - You are about to drop the column `tiktok` on the `contact_info` table. All the data in the column will be lost.
  - You are about to drop the column `twitter` on the `contact_info` table. All the data in the column will be lost.
  - You are about to drop the column `youtube` on the `contact_info` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "contact_info" DROP COLUMN "facebook",
DROP COLUMN "instagram",
DROP COLUMN "linkedin",
DROP COLUMN "tiktok",
DROP COLUMN "twitter",
DROP COLUMN "youtube";

-- CreateTable
CREATE TABLE "social_media" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_media_pkey" PRIMARY KEY ("id")
);
