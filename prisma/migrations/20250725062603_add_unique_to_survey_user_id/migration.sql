/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `survey` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "survey_user_id_key" ON "survey"("user_id");
