-- BELOURA HIRING Database Initialization

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Set timezone
SET timezone = 'UTC';
ALTER DATABASE beloura_hiring_dev SET timezone TO 'UTC';

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'BELOURA HIRING database initialized successfully';
END $$;
