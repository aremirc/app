/*
  Warnings:

  - Changed the type of `type` on the `Availability` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('PHOTO', 'VIDEO');

-- CreateEnum
CREATE TYPE "AvailabilityType" AS ENUM ('FULL_TIME', 'PART_TIME', 'ON_CALL');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PENDING_TASK', 'SYSTEM_ALERT', 'PROFILE_UPDATE', 'NEW_MESSAGE', 'ASSIGNMENT_UPDATE', 'VISIT_REMINDER', 'ACCOUNT_STATUS_CHANGE', 'FEEDBACK_REQUEST');

-- AlterTable
ALTER TABLE "Availability" DROP COLUMN "type",
ADD COLUMN     "type" "AvailabilityType" NOT NULL;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "socialLinks" JSONB,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" SERIAL NOT NULL,
    "visitId" INTEGER NOT NULL,
    "type" "EvidenceType" NOT NULL,
    "url" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Evidence_visitId_idx" ON "Evidence"("visitId");

-- CreateIndex
CREATE INDEX "Availability_userId_idx" ON "Availability"("userId");

-- CreateIndex
CREATE INDEX "Conformity_userId_idx" ON "Conformity"("userId");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "Visit_userId_idx" ON "Visit"("userId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
