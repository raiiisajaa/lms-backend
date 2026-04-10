/*
  Warnings:

  - You are about to drop the column `enrolledAt` on the `Enrollment` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Enrollment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Enrollment" DROP COLUMN "enrolledAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
