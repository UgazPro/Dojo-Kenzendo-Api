/*
  Warnings:

  - Added the required column `active` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deleted` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enrollmentDate` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Dojos" ADD COLUMN     "martialArts" INTEGER[];

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "active" BOOLEAN NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted" BOOLEAN NOT NULL,
ADD COLUMN     "enrollmentDate" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "identification" SET DATA TYPE TEXT;
