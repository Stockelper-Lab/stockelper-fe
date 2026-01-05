-- CreateTable
CREATE TABLE "portfolio_recommendations" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "investor_type" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "portfolio_recommendations_user_id_idx" ON "portfolio_recommendations"("user_id");

-- AddForeignKey
ALTER TABLE "portfolio_recommendations" ADD CONSTRAINT "portfolio_recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
