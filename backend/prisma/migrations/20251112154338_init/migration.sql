-- CreateEnum
CREATE TYPE "PipelineStage" AS ENUM ('new', 'qualifying', 'interview_scheduled', 'interview_done', 'tests_scheduled', 'tests_done', 'mock_scheduled', 'mock_done', 'onboarding_assigned', 'onboarding_done', 'probation_start', 'probation_end');

-- CreateEnum
CREATE TYPE "OwnerRole" AS ENUM ('sourcer', 'interviewer', 'chatting_managers');

-- CreateEnum
CREATE TYPE "Verdict" AS ENUM ('pass', 'fail', 'no_show', 'regular', 'not_regular');

-- CreateEnum
CREATE TYPE "BonusStatus" AS ENUM ('pending', 'approved', 'paid');

-- CreateTable
CREATE TABLE "sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "external_id" TEXT,
    "telegram" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referrers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "telegram" TEXT,
    "country" TEXT,
    "timezone" TEXT,
    "source_id" TEXT,
    "referrer_id" TEXT,
    "current_stage" "PipelineStage" NOT NULL DEFAULT 'new',
    "current_owner" "OwnerRole",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipeline_stages" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "stage" "PipelineStage" NOT NULL,
    "status" TEXT NOT NULL,
    "owner_role" "OwnerRole",
    "scheduled_date" TIMESTAMP(3),
    "completed_date" TIMESTAMP(3),
    "verdict" "Verdict",
    "remarks" TEXT,
    "turnaround_time_hours" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pipeline_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tests" (
    "id" TEXT NOT NULL,
    "stage_id" TEXT NOT NULL,
    "wpm_score" INTEGER,
    "english_score" DECIMAL(5,2),
    "pass" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mocks" (
    "id" TEXT NOT NULL,
    "stage_id" TEXT NOT NULL,
    "verdict" "Verdict",
    "scheduled_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "probation" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "verdict" "Verdict",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "probation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_bonuses" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "referrer_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL DEFAULT 20.00,
    "status" "BonusStatus" NOT NULL DEFAULT 'pending',
    "approved_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_bonuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "user_id" TEXT,
    "user_role" TEXT,
    "action" TEXT NOT NULL,
    "old_value" JSONB,
    "new_value" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "OwnerRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sources_name_key" ON "sources"("name");

-- CreateIndex
CREATE INDEX "referrers_external_id_idx" ON "referrers"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "referrers_name_external_id_key" ON "referrers"("name", "external_id");

-- CreateIndex
CREATE INDEX "candidates_current_stage_idx" ON "candidates"("current_stage");

-- CreateIndex
CREATE INDEX "candidates_source_id_idx" ON "candidates"("source_id");

-- CreateIndex
CREATE INDEX "candidates_referrer_id_idx" ON "candidates"("referrer_id");

-- CreateIndex
CREATE INDEX "candidates_created_at_idx" ON "candidates"("created_at");

-- CreateIndex
CREATE INDEX "pipeline_stages_candidate_id_idx" ON "pipeline_stages"("candidate_id");

-- CreateIndex
CREATE INDEX "pipeline_stages_stage_idx" ON "pipeline_stages"("stage");

-- CreateIndex
CREATE INDEX "pipeline_stages_completed_date_idx" ON "pipeline_stages"("completed_date");

-- CreateIndex
CREATE UNIQUE INDEX "tests_stage_id_key" ON "tests"("stage_id");

-- CreateIndex
CREATE INDEX "tests_stage_id_idx" ON "tests"("stage_id");

-- CreateIndex
CREATE UNIQUE INDEX "mocks_stage_id_key" ON "mocks"("stage_id");

-- CreateIndex
CREATE INDEX "mocks_stage_id_idx" ON "mocks"("stage_id");

-- CreateIndex
CREATE UNIQUE INDEX "probation_candidate_id_key" ON "probation"("candidate_id");

-- CreateIndex
CREATE INDEX "probation_candidate_id_idx" ON "probation"("candidate_id");

-- CreateIndex
CREATE INDEX "probation_end_date_idx" ON "probation"("end_date");

-- CreateIndex
CREATE UNIQUE INDEX "referral_bonuses_candidate_id_key" ON "referral_bonuses"("candidate_id");

-- CreateIndex
CREATE INDEX "referral_bonuses_referrer_id_idx" ON "referral_bonuses"("referrer_id");

-- CreateIndex
CREATE INDEX "referral_bonuses_status_idx" ON "referral_bonuses"("status");

-- CreateIndex
CREATE INDEX "audit_log_entity_type_entity_id_idx" ON "audit_log"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_log_timestamp_idx" ON "audit_log"("timestamp");

-- CreateIndex
CREATE INDEX "audit_log_user_id_idx" ON "audit_log"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "referrers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipeline_stages" ADD CONSTRAINT "pipeline_stages_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "pipeline_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mocks" ADD CONSTRAINT "mocks_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "pipeline_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "probation" ADD CONSTRAINT "probation_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_bonuses" ADD CONSTRAINT "referral_bonuses_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_bonuses" ADD CONSTRAINT "referral_bonuses_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "referrers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
