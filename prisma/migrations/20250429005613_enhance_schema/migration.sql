/*
  Warnings:

  - You are about to drop the column `dni` on the `Availability` table. All the data in the column will be lost.
  - You are about to drop the column `workerId` on the `Conformity` table. All the data in the column will be lost.
  - The primary key for the `OrderWorker` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `duration` on the `OrderWorker` table. All the data in the column will be lost.
  - You are about to drop the column `workerId` on the `OrderWorker` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Visit` table. All the data in the column will be lost.
  - You are about to drop the column `userDni` on the `Visit` table. All the data in the column will be lost.
  - You are about to drop the column `workerId` on the `Visit` table. All the data in the column will be lost.
  - You are about to drop the `Worker` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RolePermissions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Availability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Conformity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `OrderWorker` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `OrderWorker` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `status` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `Visit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Visit` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "OrderWorkerStatus" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED', 'REASSIGNED', 'DECLINED');

-- DropForeignKey
ALTER TABLE "Availability" DROP CONSTRAINT "Availability_dni_fkey";

-- DropForeignKey
ALTER TABLE "Conformity" DROP CONSTRAINT "Conformity_workerId_fkey";

-- DropForeignKey
ALTER TABLE "OrderWorker" DROP CONSTRAINT "OrderWorker_workerId_fkey";

-- DropForeignKey
ALTER TABLE "Visit" DROP CONSTRAINT "Visit_userDni_fkey";

-- DropForeignKey
ALTER TABLE "Visit" DROP CONSTRAINT "Visit_workerId_fkey";

-- DropForeignKey
ALTER TABLE "_RolePermissions" DROP CONSTRAINT "_RolePermissions_A_fkey";

-- DropForeignKey
ALTER TABLE "_RolePermissions" DROP CONSTRAINT "_RolePermissions_B_fkey";

-- AlterTable
ALTER TABLE "Availability" DROP COLUMN "dni",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Conformity" DROP COLUMN "workerId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrderWorker" DROP CONSTRAINT "OrderWorker_pkey",
DROP COLUMN "duration",
DROP COLUMN "workerId",
ADD COLUMN     "userId" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "OrderWorkerStatus" NOT NULL,
ADD CONSTRAINT "OrderWorker_pkey" PRIMARY KEY ("orderId", "userId");

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "ServiceStatus" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "Visit" DROP COLUMN "duration",
DROP COLUMN "userDni",
DROP COLUMN "workerId",
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Worker";

-- DropTable
DROP TABLE "_RolePermissions";

-- CreateTable
CREATE TABLE "_PermissionsOfRole" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PermissionsOfRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PermissionsOfRole_B_index" ON "_PermissionsOfRole"("B");

-- AddForeignKey
ALTER TABLE "OrderWorker" ADD CONSTRAINT "OrderWorker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conformity" ADD CONSTRAINT "Conformity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionsOfRole" ADD CONSTRAINT "_PermissionsOfRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionsOfRole" ADD CONSTRAINT "_PermissionsOfRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
