/*
  Warnings:

  - You are about to drop the column `answers` on the `survey` table. All the data in the column will be lost.
  - Added the required column `answer` to the `survey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "survey" DROP COLUMN "answers",
ADD COLUMN     "answer" JSONB NOT NULL;
