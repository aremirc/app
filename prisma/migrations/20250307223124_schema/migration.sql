/*
  Warnings:

  - Added the required column `type` to the `Availability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workerId` to the `Conformity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `OrderWorker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `OrderWorker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Visit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'FAILED';

-- AlterTable
ALTER TABLE "Availability" ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Conformity" ADD COLUMN     "workerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrderWorker" ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "averageSatisfaction" DOUBLE PRECISION,
ADD COLUMN     "completedOrders" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalWorkingTime" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Visit" ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "evaluation" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Worker" ADD COLUMN     "satisfaction" DOUBLE PRECISION,
ADD COLUMN     "totalTime" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalVisits" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "_OrderToService" ADD CONSTRAINT "_OrderToService_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_OrderToService_AB_unique";

-- AddForeignKey
ALTER TABLE "Conformity" ADD CONSTRAINT "Conformity_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;
