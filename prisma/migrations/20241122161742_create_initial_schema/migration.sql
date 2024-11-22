/*
  Warnings:

  - You are about to drop the column `userDni` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `workerId` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userDni_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_workerId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "userDni",
DROP COLUMN "workerId",
ADD COLUMN     "statusDetails" TEXT,
ADD COLUMN     "userId" TEXT;

-- CreateTable
CREATE TABLE "OrderWorker" (
    "orderId" INTEGER NOT NULL,
    "workerId" TEXT NOT NULL,

    CONSTRAINT "OrderWorker_pkey" PRIMARY KEY ("orderId","workerId")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("dni") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderWorker" ADD CONSTRAINT "OrderWorker_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderWorker" ADD CONSTRAINT "OrderWorker_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;
