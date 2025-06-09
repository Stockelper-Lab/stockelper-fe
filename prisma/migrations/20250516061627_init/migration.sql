-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "kis_app_key" TEXT NOT NULL,
    "kis_app_secret" TEXT NOT NULL,
    "kis_access_token" TEXT,
    "account_no" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
