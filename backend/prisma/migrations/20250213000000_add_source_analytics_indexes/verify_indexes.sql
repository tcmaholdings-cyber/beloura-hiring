-- Verification Script for Source Analytics Indexes
-- Run this after applying the migration to verify indexes are created and working

-- ============================================================================
-- Part 1: Verify All Indexes Exist
-- ============================================================================

SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'candidates'
    AND indexname IN (
        'candidates_source_id_interview_rating_idx',
        'candidates_source_id_current_stage_idx',
        'candidates_updated_at_idx',
        'candidates_source_id_updated_at_idx'
    )
ORDER BY indexname;

-- Expected: 4 rows, one for each index

-- ============================================================================
-- Part 2: Check Index Sizes
-- ============================================================================

SELECT
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan as scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename = 'candidates'
    AND indexname LIKE 'candidates_source_id%'
    OR indexname = 'candidates_updated_at_idx'
ORDER BY indexname;

-- Expected: Index sizes and usage statistics (scans will be 0 initially)

-- ============================================================================
-- Part 3: Query Plan Analysis - Test Index Usage
-- ============================================================================

-- Test 1: Source + Interview Rating Index
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT source_id, AVG(interview_rating) as avg_rating
FROM candidates
WHERE interview_rating IS NOT NULL
GROUP BY source_id;

-- Expected: "Index Only Scan using candidates_source_id_interview_rating_idx"
-- or "Index Scan using candidates_source_id_interview_rating_idx"

-- Test 2: Source + Current Stage Index
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT source_id, current_stage, COUNT(*) as candidate_count
FROM candidates
GROUP BY source_id, current_stage;

-- Expected: "Index Only Scan using candidates_source_id_current_stage_idx"

-- Test 3: Updated At Index
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT COUNT(*) as stagnant_count
FROM candidates
WHERE updated_at < NOW() - INTERVAL '30 days';

-- Expected: "Index Scan using candidates_updated_at_idx"

-- Test 4: Source + Updated At Index
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT source_id, COUNT(*) as stagnant_count
FROM candidates
WHERE updated_at < NOW() - INTERVAL '30 days'
GROUP BY source_id;

-- Expected: "Index Scan using candidates_source_id_updated_at_idx"

-- ============================================================================
-- Part 4: Performance Comparison Queries
-- ============================================================================

-- Query 1: Average rating by source (should use composite index)
SELECT source_id, AVG(interview_rating) as avg_rating
FROM candidates
WHERE interview_rating IS NOT NULL
GROUP BY source_id
ORDER BY avg_rating DESC;

-- Query 2: Rating distribution by source (should use composite index)
SELECT
    source_id,
    interview_rating,
    COUNT(*) as candidate_count
FROM candidates
WHERE interview_rating IS NOT NULL
GROUP BY source_id, interview_rating
ORDER BY source_id, interview_rating;

-- Query 3: Pipeline conversion by source (should use composite index)
SELECT
    source_id,
    current_stage,
    COUNT(*) as candidate_count,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY source_id), 2) as percentage
FROM candidates
GROUP BY source_id, current_stage
ORDER BY source_id, current_stage;

-- Query 4: Stagnant candidates (should use updated_at index)
SELECT
    id,
    name,
    current_stage,
    updated_at,
    NOW() - updated_at as time_since_update
FROM candidates
WHERE updated_at < NOW() - INTERVAL '30 days'
ORDER BY updated_at ASC
LIMIT 100;

-- Query 5: Stagnation by source (should use composite index)
SELECT
    source_id,
    COUNT(*) as total_candidates,
    COUNT(CASE WHEN updated_at < NOW() - INTERVAL '30 days' THEN 1 END) as stagnant_count,
    ROUND(100.0 * COUNT(CASE WHEN updated_at < NOW() - INTERVAL '30 days' THEN 1 END) / COUNT(*), 2) as stagnant_percentage
FROM candidates
WHERE source_id IS NOT NULL
GROUP BY source_id
ORDER BY stagnant_percentage DESC;

-- ============================================================================
-- Part 5: Index Health Check
-- ============================================================================

-- Check for index bloat (should be minimal for new indexes)
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan as times_used,
    CASE
        WHEN idx_scan = 0 THEN 'UNUSED'
        WHEN idx_scan < 100 THEN 'LOW USAGE'
        ELSE 'ACTIVE'
    END as usage_status
FROM pg_stat_user_indexes
WHERE tablename = 'candidates'
ORDER BY idx_scan DESC;

-- ============================================================================
-- Part 6: Statistics Check
-- ============================================================================

-- Verify statistics are up to date (important for query planner)
SELECT
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    most_common_vals
FROM pg_stats
WHERE tablename = 'candidates'
    AND attname IN ('source_id', 'interview_rating', 'current_stage', 'updated_at')
ORDER BY attname;

-- If statistics are stale, run: ANALYZE candidates;

-- ============================================================================
-- Expected Results Summary
-- ============================================================================

/*
PART 1: Should show 4 indexes created
PART 2: Should show index sizes (typically 100KB - 1MB per index)
PART 3: Should show "Index Scan" or "Index Only Scan" in query plans, NOT "Seq Scan"
PART 4: Should return results quickly (< 20ms for 10K rows)
PART 5: Should show indexes are being used (idx_scan > 0 after queries)
PART 6: Should show reasonable n_distinct values and correlation

If any test shows "Seq Scan" instead of "Index Scan":
1. Run: ANALYZE candidates;
2. Re-run EXPLAIN query
3. Check if query pattern matches index column order
4. Verify WHERE clause uses indexed columns

If indexes aren't being used:
1. Check PostgreSQL version (should be 12+)
2. Verify random_page_cost setting (default 4.0 is fine)
3. Run: SET enable_seqscan = off; (testing only, don't keep in production)
4. Re-run EXPLAIN to force index usage
*/
