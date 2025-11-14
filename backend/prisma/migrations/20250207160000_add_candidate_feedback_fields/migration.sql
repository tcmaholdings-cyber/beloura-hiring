-- Add interview rating and notes columns to candidates
ALTER TABLE "candidates"
ADD COLUMN IF NOT EXISTS "interview_rating" INTEGER,
ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- Ensure interview rating stays within the 1-5 Likert range if provided
ALTER TABLE "candidates"
ADD CONSTRAINT "candidates_interview_rating_range"
CHECK (
  "interview_rating" IS NULL OR
  ("interview_rating" BETWEEN 1 AND 5)
);
