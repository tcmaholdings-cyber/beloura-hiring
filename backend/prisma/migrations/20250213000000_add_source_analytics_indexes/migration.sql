-- Add composite indexes for source analytics performance optimization
-- These indexes support queries that group candidates by source with filters on interview_rating and current_stage

-- Composite index for source + interview_rating queries
-- Supports: GROUP BY source_id with WHERE interview_rating filters
-- Use case: Analyzing candidate quality by source (average ratings, rating distributions)
CREATE INDEX IF NOT EXISTS "candidates_source_id_interview_rating_idx"
ON "candidates"("source_id", "interview_rating");

-- Composite index for source + current_stage queries
-- Supports: GROUP BY source_id with WHERE current_stage filters
-- Use case: Analyzing pipeline conversion by source (stage distributions, conversion rates)
CREATE INDEX IF NOT EXISTS "candidates_source_id_current_stage_idx"
ON "candidates"("source_id", "current_stage");

-- Index on updated_at for stagnant candidate detection
-- Supports: WHERE updated_at < threshold queries
-- Use case: Finding candidates who haven't moved stages in X days
CREATE INDEX IF NOT EXISTS "candidates_updated_at_idx"
ON "candidates"("updated_at");

-- Composite index for source + updated_at for combined stagnation analysis by source
-- Supports: GROUP BY source_id with WHERE updated_at filters
-- Use case: Identifying which sources have the most stagnant candidates
CREATE INDEX IF NOT EXISTS "candidates_source_id_updated_at_idx"
ON "candidates"("source_id", "updated_at");
