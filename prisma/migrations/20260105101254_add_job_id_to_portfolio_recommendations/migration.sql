-- AlterTable
ALTER TABLE "portfolio_recommendations" ADD COLUMN     "job_id" TEXT;

-- CreateIndex
CREATE INDEX "portfolio_recommendations_job_id_idx" ON "portfolio_recommendations"("job_id");
