-- ─────────────────────────────────────────────────────────────────────────────
-- Supabase Migration: Drop branches table and branch_id columns
-- ─────────────────────────────────────────────────────────────────────────────
-- Branches have been removed from the app. All data is now tenant-scoped
-- (church-level) only. This migration:
--   1. Drops branch_id columns from all tables that have them
--   2. Drops the branches table entirely
--   3. Drops the max_branches column from tenants
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Drop branch_id columns from tables ───────────────────────────────────
-- Attendance records (NestJS schema)
ALTER TABLE attendance_records DROP COLUMN IF EXISTS branch_id;

-- Check which other tables have branch_id and drop it
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE column_name = 'branch_id'
          AND table_schema = 'public'
          AND table_name != 'branches'
    LOOP
        EXECUTE format('ALTER TABLE %I DROP COLUMN IF EXISTS %I', r.table_name, r.column_name);
        RAISE NOTICE 'Dropped column % from table %', r.column_name, r.table_name;
    END LOOP;
END $$;

-- ── 2. Drop the branches table ──────────────────────────────────────────────
DROP TABLE IF EXISTS branches CASCADE;

-- ── 3. Drop max_branches from tenants ───────────────────────────────────────
ALTER TABLE tenants DROP COLUMN IF EXISTS max_branches;

-- ── 4. Verify ───────────────────────────────────────────────────────────────
SELECT 'branches table exists' AS check
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'branches' AND table_schema = 'public');

-- Should return 0 rows (branches table gone)
SELECT table_name, column_name
FROM information_schema.columns
WHERE column_name = 'branch_id' AND table_schema = 'public';

-- Should return 0 rows (max_branches gone)
SELECT column_name
FROM information_schema.columns
WHERE column_name = 'max_branches' AND table_schema = 'public' AND table_name = 'tenants';
