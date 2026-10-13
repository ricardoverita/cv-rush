-- CreateEnum
CREATE TYPE "developer_status" AS ENUM ('provisional', 'claimed', 'merged', 'deleted');

-- CreateEnum
CREATE TYPE "profile_visibility" AS ENUM ('private', 'public');

-- CreateEnum
CREATE TYPE "seniority" AS ENUM ('trainee', 'junior', 'mid', 'senior', 'lead', 'staff', 'principal');

-- CreateTable
CREATE TABLE "developers" (
    "id" UUID NOT NULL,
    "status" "developer_status" NOT NULL DEFAULT 'provisional',
    "display_name" VARCHAR(64) NOT NULL,
    "profile_visibility" "profile_visibility" NOT NULL DEFAULT 'private',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "last_active_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "developers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_credentials" (
    "id" UUID NOT NULL,
    "developer_id" UUID NOT NULL,
    "token_hash" BYTEA NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(3),

    CONSTRAINT "device_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "developer_profiles" (
    "developer_id" UUID NOT NULL,
    "seniority" "seniority" NOT NULL,
    "role_id" VARCHAR(64) NOT NULL,
    "technology_ids" VARCHAR(64)[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "developer_profiles_pkey" PRIMARY KEY ("developer_id")
);

-- CreateIndex
CREATE INDEX "developers_last_active_at_idx" ON "developers"("last_active_at");

-- CreateIndex
CREATE UNIQUE INDEX "device_credentials_token_hash_key" ON "device_credentials"("token_hash");

-- CreateIndex
CREATE INDEX "device_credentials_developer_id_idx" ON "device_credentials"("developer_id");

-- CreateIndex
CREATE INDEX "developer_profiles_technology_ids_idx" ON "developer_profiles" USING GIN ("technology_ids");

-- AddForeignKey
ALTER TABLE "device_credentials" ADD CONSTRAINT "device_credentials_developer_id_fkey" FOREIGN KEY ("developer_id") REFERENCES "developers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "developer_profiles" ADD CONSTRAINT "developer_profiles_developer_id_fkey" FOREIGN KEY ("developer_id") REFERENCES "developers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
