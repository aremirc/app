/*
  Warnings:

  - The primary key for the `Client` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dni` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `managedById` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderId]` on the table `Conformity` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Visit` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- DropForeignKey
ALTER TABLE "Conformity" DROP CONSTRAINT "Conformity_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_managedById_fkey";

-- DropForeignKey
ALTER TABLE "Visit" DROP CONSTRAINT "Visit_clientId_fkey";

-- DropIndex
DROP INDEX "Order_managedById_idx";

-- AlterTable
ALTER TABLE "Client" DROP CONSTRAINT "Client_pkey",
DROP COLUMN "dni",
ADD COLUMN     "contactPersonName" TEXT,
ADD COLUMN     "contactPersonPhone" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "type" "ClientType" NOT NULL,
ADD CONSTRAINT "Client_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Conformity" ADD COLUMN     "accepted" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "conformityDate" TIMESTAMP(3),
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "files" JSONB,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "signature" TEXT;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "managedById",
ADD COLUMN     "alternateContactName" TEXT,
ADD COLUMN     "alternateContactPhone" TEXT,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "OrderWorker" ADD COLUMN     "isResponsible" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "estimatedTime" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "location",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "country" TEXT;

-- AlterTable
ALTER TABLE "Visit" ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "isReviewed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedBy" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Conformity_orderId_key" ON "Conformity"("orderId");

-- CreateIndex
CREATE INDEX "Order_createdBy_idx" ON "Order"("createdBy");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conformity" ADD CONSTRAINT "Conformity_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
