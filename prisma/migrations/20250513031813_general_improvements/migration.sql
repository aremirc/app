/*
  Warnings:

  - You are about to drop the column `userId` on the `Order` table. All the data in the column will be lost.
  - Added the required column `gender` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "ToolStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'LOST', 'RETIRED');

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropIndex
DROP INDEX "Order_userId_idx";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "userId",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "managedById" TEXT,
ADD COLUMN     "scheduledDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gender" "Gender" NOT NULL;

-- CreateTable
CREATE TABLE "Tool" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "serial" TEXT,
    "status" "ToolStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolAssignment" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedAt" TIMESTAMP(3),

    CONSTRAINT "ToolAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "label" TEXT,
    "orderId" INTEGER,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tool_serial_key" ON "Tool"("serial");

-- CreateIndex
CREATE INDEX "Order_managedById_idx" ON "Order"("managedById");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_managedById_fkey" FOREIGN KEY ("managedById") REFERENCES "User"("dni") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolAssignment" ADD CONSTRAINT "ToolAssignment_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolAssignment" ADD CONSTRAINT "ToolAssignment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
