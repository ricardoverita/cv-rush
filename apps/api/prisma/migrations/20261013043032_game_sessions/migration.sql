-- CreateEnum
CREATE TYPE "question_source" AS ENUM ('sample', 'fake_provider', 'ai_generated', 'community', 'curated');

-- CreateEnum
CREATE TYPE "question_lifecycle_state" AS ENUM ('generated', 'validated', 'rejected', 'competitive', 'practice', 'retired', 'invalidated', 'archived');

-- CreateEnum
CREATE TYPE "verification_tier" AS ENUM ('sample', 'ai_generated', 'ai_validated', 'human_reviewed', 'curated');

-- CreateEnum
CREATE TYPE "job_challenge_source" AS ENUM ('generated', 'daily', 'job_posting');

-- CreateEnum
CREATE TYPE "job_posting_origin" AS ENUM ('generated', 'published');

-- CreateEnum
CREATE TYPE "run_type" AS ENUM ('ranked', 'practice');

-- CreateEnum
CREATE TYPE "session_status" AS ENUM ('created', 'in_progress', 'delivered', 'failed', 'abandoned', 'expired_unstarted');

-- CreateEnum
CREATE TYPE "session_stage" AS ENUM ('job_review', 'segment_1', 'recruiter', 'segment_2', 'ats', 'segment_3', 'hiring_manager', 'segment_4', 'final', 'finished');

-- CreateEnum
CREATE TYPE "challenge_stage" AS ENUM ('recruiter', 'ats', 'hiring_manager', 'final');

-- CreateEnum
CREATE TYPE "challenge_status" AS ENUM ('open', 'completed');

-- CreateEnum
CREATE TYPE "attempt_outcome" AS ENUM ('correct', 'incorrect', 'timeout', 'graded', 'neutral');

-- CreateEnum
CREATE TYPE "result_status" AS ENUM ('delivered', 'failed', 'abandoned');

-- AlterTable
ALTER TABLE "developer_profiles" ADD COLUMN     "ranked_locked_until" TIMESTAMPTZ(3);

-- CreateTable
CREATE TABLE "question_contexts" (
    "key" VARCHAR(80) NOT NULL,
    "kind" VARCHAR(16) NOT NULL,
    "level" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_contexts_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "generation_batches" (
    "id" UUID NOT NULL,
    "context_key" VARCHAR(80) NOT NULL,
    "provider" VARCHAR(40) NOT NULL,
    "verifier" VARCHAR(40) NOT NULL,
    "prompt_version" VARCHAR(40) NOT NULL,
    "requested" INTEGER NOT NULL,
    "accepted" INTEGER NOT NULL DEFAULT 0,
    "rejected" INTEGER NOT NULL DEFAULT 0,
    "rejections" JSONB NOT NULL DEFAULT '[]',
    "status" VARCHAR(16) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(3),

    CONSTRAINT "generation_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" UUID NOT NULL,
    "context_key" VARCHAR(80) NOT NULL,
    "source" "question_source" NOT NULL,
    "external_ref" VARCHAR(160),
    "lifecycle_state" "question_lifecycle_state" NOT NULL,
    "verification_tier" "verification_tier" NOT NULL,
    "batch_id" UUID,
    "ranked_exposures" INTEGER NOT NULL DEFAULT 0,
    "competitive_since" TIMESTAMPTZ(3),
    "retired_at" TIMESTAMPTZ(3),
    "invalidated_at" TIMESTAMPTZ(3),
    "invalidation_reason" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_versions" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "option_ids" VARCHAR(1)[],
    "correct_option_id" VARCHAR(1) NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "technology_ids" VARCHAR(64)[],
    "topics" VARCHAR(80)[],
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_postings" (
    "id" UUID NOT NULL,
    "origin" "job_posting_origin" NOT NULL,
    "company_name" VARCHAR(120) NOT NULL,
    "facts" JSONB NOT NULL,
    "texts" JSONB NOT NULL,
    "content_version" VARCHAR(40) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_postings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_challenges" (
    "id" UUID NOT NULL,
    "source" "job_challenge_source" NOT NULL,
    "job_posting_id" UUID NOT NULL,
    "run_type" "run_type" NOT NULL,
    "category_key" VARCHAR(80) NOT NULL,
    "day_key" VARCHAR(10) NOT NULL,
    "blueprint" JSONB NOT NULL,
    "ruleset_version" VARCHAR(40) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_sessions" (
    "id" UUID NOT NULL,
    "developer_id" UUID NOT NULL,
    "run_type" "run_type" NOT NULL,
    "status" "session_status" NOT NULL DEFAULT 'created',
    "stage" "session_stage" NOT NULL DEFAULT 'job_review',
    "active" BOOLEAN DEFAULT true,
    "snapshot" JSONB NOT NULL,
    "category_key" VARCHAR(80) NOT NULL,
    "job_challenge_id" UUID NOT NULL,
    "seed" BYTEA NOT NULL,
    "locale" VARCHAR(5) NOT NULL,
    "ruleset_version" VARCHAR(40) NOT NULL,
    "scoring_version" VARCHAR(40) NOT NULL,
    "season_id" TEXT NOT NULL,
    "day_key" VARCHAR(10) NOT NULL,
    "cv_health" INTEGER NOT NULL,
    "reason_code" VARCHAR(40),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "review_expires_at" TIMESTAMPTZ(3) NOT NULL,
    "committed_at" TIMESTAMPTZ(3),
    "stage_started_at" TIMESTAMPTZ(3),
    "expires_at" TIMESTAMPTZ(3),
    "ended_at" TIMESTAMPTZ(3),
    "last_activity_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranked_attempts" (
    "developer_id" UUID NOT NULL,
    "day_key" VARCHAR(10) NOT NULL,
    "number" INTEGER NOT NULL,
    "session_id" UUID NOT NULL,
    "committed_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ranked_attempts_pkey" PRIMARY KEY ("developer_id","day_key","number")
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "stage" "challenge_stage" NOT NULL,
    "status" "challenge_status" NOT NULL DEFAULT 'open',
    "opened_at" TIMESTAMPTZ(3) NOT NULL,
    "deadline_at" TIMESTAMPTZ(3),
    "completed_at" TIMESTAMPTZ(3),
    "payload" JSONB,
    "outcome" JSONB,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_attempts" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "challenge_id" UUID NOT NULL,
    "developer_id" UUID NOT NULL,
    "run_type" "run_type" NOT NULL,
    "stage" "challenge_stage" NOT NULL,
    "slot" VARCHAR(4) NOT NULL,
    "kind" VARCHAR(32) NOT NULL,
    "level" INTEGER NOT NULL,
    "question_id" UUID,
    "question_version_id" UUID,
    "template_id" VARCHAR(40),
    "presented" JSONB NOT NULL,
    "answer_key" JSONB NOT NULL,
    "explanation" TEXT,
    "served_at" TIMESTAMPTZ(3) NOT NULL,
    "deadline_at" TIMESTAMPTZ(3) NOT NULL,
    "window_ms" INTEGER NOT NULL,
    "answered_at" TIMESTAMPTZ(3),
    "selected_option_id" VARCHAR(1),
    "outcome" "attempt_outcome",
    "grade" VARCHAR(16),
    "response_ms" INTEGER,

    CONSTRAINT "question_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_results" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "developer_id" UUID NOT NULL,
    "job_challenge_id" UUID NOT NULL,
    "run_type" "run_type" NOT NULL,
    "status" "result_status" NOT NULL,
    "reason_code" VARCHAR(40),
    "total_score" INTEGER NOT NULL,
    "breakdown" JSONB NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "counts" JSONB NOT NULL,
    "ats_match" DOUBLE PRECISION,
    "cv_health" INTEGER NOT NULL,
    "competing_context" JSONB NOT NULL,
    "job_summary" JSONB NOT NULL,
    "season_id" TEXT NOT NULL,
    "day_key" VARCHAR(10) NOT NULL,
    "scoring_version" VARCHAR(40) NOT NULL,
    "ruleset_version" VARCHAR(40) NOT NULL,
    "started_at" TIMESTAMPTZ(3),
    "ended_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "generation_batches_context_key_idx" ON "generation_batches"("context_key");

-- CreateIndex
CREATE UNIQUE INDEX "questions_external_ref_key" ON "questions"("external_ref");

-- CreateIndex
CREATE INDEX "questions_context_key_lifecycle_state_idx" ON "questions"("context_key", "lifecycle_state");

-- CreateIndex
CREATE UNIQUE INDEX "question_versions_question_id_version_key" ON "question_versions"("question_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "game_sessions_job_challenge_id_key" ON "game_sessions"("job_challenge_id");

-- CreateIndex
CREATE INDEX "game_sessions_developer_id_created_at_idx" ON "game_sessions"("developer_id", "created_at");

-- CreateIndex
CREATE INDEX "game_sessions_status_review_expires_at_idx" ON "game_sessions"("status", "review_expires_at");

-- CreateIndex
CREATE INDEX "game_sessions_status_expires_at_idx" ON "game_sessions"("status", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "game_sessions_developer_id_active_key" ON "game_sessions"("developer_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "ranked_attempts_session_id_key" ON "ranked_attempts"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "challenges_session_id_stage_key" ON "challenges"("session_id", "stage");

-- CreateIndex
CREATE INDEX "question_attempts_developer_id_question_id_idx" ON "question_attempts"("developer_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "question_attempts_challenge_id_slot_key" ON "question_attempts"("challenge_id", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "game_results_session_id_key" ON "game_results"("session_id");

-- CreateIndex
CREATE INDEX "game_results_developer_id_created_at_idx" ON "game_results"("developer_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "generation_batches" ADD CONSTRAINT "generation_batches_context_key_fkey" FOREIGN KEY ("context_key") REFERENCES "question_contexts"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_context_key_fkey" FOREIGN KEY ("context_key") REFERENCES "question_contexts"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "generation_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_versions" ADD CONSTRAINT "question_versions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_challenges" ADD CONSTRAINT "job_challenges_job_posting_id_fkey" FOREIGN KEY ("job_posting_id") REFERENCES "job_postings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_developer_id_fkey" FOREIGN KEY ("developer_id") REFERENCES "developers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_job_challenge_id_fkey" FOREIGN KEY ("job_challenge_id") REFERENCES "job_challenges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranked_attempts" ADD CONSTRAINT "ranked_attempts_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_attempts" ADD CONSTRAINT "question_attempts_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_attempts" ADD CONSTRAINT "question_attempts_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_results" ADD CONSTRAINT "game_results_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_results" ADD CONSTRAINT "game_results_developer_id_fkey" FOREIGN KEY ("developer_id") REFERENCES "developers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_results" ADD CONSTRAINT "game_results_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------------------------
-- Integrity rules that Prisma's schema language can't express (and its drift check ignores).

-- A fourth ranked attempt on the same UTC day is impossible (ADR-019; ruleset-v0: 3 per day).
ALTER TABLE "ranked_attempts" ADD CONSTRAINT "ranked_attempts_number_range" CHECK ("number" BETWEEN 1 AND 3);

ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_cv_health_range" CHECK ("cv_health" BETWEEN 0 AND 100);
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_seed_length" CHECK (octet_length("seed") = 32);
-- `active` is true while the session runs and NULL afterwards (never false), so the unique index
-- (developer_id, active) allows exactly one active session per Developer.
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_active_true_or_null" CHECK ("active" IS NULL OR "active");
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_active_matches_status" CHECK (("active" IS NOT NULL) = ("status" IN ('created', 'in_progress')));

-- History is immutable (ADR-016): results and question versions are never updated. Results can
-- only be deleted by an explicit, audited data-deletion command that sets
-- `cvrush.allow_history_delete = on` for its transaction (not available over HTTP).
CREATE FUNCTION "reject_history_change"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' AND current_setting('cvrush.allow_history_delete', true) = 'on' THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION '% is immutable: % rejected', TG_TABLE_NAME, TG_OP USING ERRCODE = 'restrict_violation';
END;
$$;

CREATE TRIGGER "game_results_immutable" BEFORE UPDATE OR DELETE ON "game_results"
  FOR EACH ROW EXECUTE FUNCTION "reject_history_change"();
CREATE TRIGGER "question_versions_immutable" BEFORE UPDATE OR DELETE ON "question_versions"
  FOR EACH ROW EXECUTE FUNCTION "reject_history_change"();
