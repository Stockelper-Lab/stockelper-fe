-- CreateTable
CREATE TABLE "survey" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_pkey" PRIMARY KEY ("id")
);
