-- ─────────────────────────────────────────────────────────────────────────────
-- Paradise AG — Supabase RLS Migration (Part 2)
-- Run this in the Supabase Dashboard → SQL Editor → New query → Paste → Run
--
-- supabase_rls_migration.sql fixed anon access for: users, tenants, members,
-- branches, departments, sermons, events, community_*, library_books,
-- devotion_guides, bible_study_resources.
--
-- It did NOT cover the tables below, which were left with the original
-- "authenticated"-only policies from supabase_schema.sql. Since the Flutter
-- app only ever uses the Supabase anon key (it authenticates against the
-- NestJS backend, not Supabase Auth), these tables have been silently
-- blocking all reads/writes — this is why attendance, finance, welfare,
-- ministries, contributions, and budgets never load in the app while
-- library/community/sermons/events do.
-- ─────────────────────────────────────────────────────────────────────────────

-- Attendance
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all_attendance" ON attendance_records;
DROP POLICY IF EXISTS "anon_all_attendance_records" ON attendance_records;
CREATE POLICY "anon_all_attendance_records" ON attendance_records FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Finance: transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all_transactions" ON transactions;
DROP POLICY IF EXISTS "anon_all_transactions" ON transactions;
CREATE POLICY "anon_all_transactions" ON transactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Welfare
ALTER TABLE welfare_cases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all_welfare" ON welfare_cases;
DROP POLICY IF EXISTS "anon_all_welfare_cases" ON welfare_cases;
CREATE POLICY "anon_all_welfare_cases" ON welfare_cases FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE welfare_finance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all_welfare_fin" ON welfare_finance;
DROP POLICY IF EXISTS "anon_all_welfare_finance" ON welfare_finance;
CREATE POLICY "anon_all_welfare_finance" ON welfare_finance FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Ministries
ALTER TABLE ministries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all_ministries" ON ministries;
DROP POLICY IF EXISTS "anon_all_ministries" ON ministries;
CREATE POLICY "anon_all_ministries" ON ministries FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE ministry_finance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all_ministry_fin" ON ministry_finance;
DROP POLICY IF EXISTS "anon_all_ministry_finance" ON ministry_finance;
CREATE POLICY "anon_all_ministry_finance" ON ministry_finance FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Contributions
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all_contributions" ON contributions;
DROP POLICY IF EXISTS "anon_all_contributions" ON contributions;
CREATE POLICY "anon_all_contributions" ON contributions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Budgets
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all_budgets" ON budgets;
DROP POLICY IF EXISTS "anon_all_budgets" ON budgets;
CREATE POLICY "anon_all_budgets" ON budgets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Finance approvals
ALTER TABLE finance_approvals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all_finance_approvals" ON finance_approvals;
DROP POLICY IF EXISTS "anon_all_finance_approvals" ON finance_approvals;
CREATE POLICY "anon_all_finance_approvals" ON finance_approvals FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Add tenant_id to any of these that may be missing it (same safe pattern as
-- supabase_rls_migration.sql — NestJS/TypeORM tables may use tenant_id or
-- church_id inconsistently; the app's SyncService already falls back across
-- both, but tenant_id is added here for tables that have neither).
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attendance_records' AND column_name = 'tenant_id') THEN
    ALTER TABLE attendance_records ADD COLUMN tenant_id TEXT;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'tenant_id') THEN
    ALTER TABLE transactions ADD COLUMN tenant_id TEXT;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'welfare_cases' AND column_name = 'tenant_id') THEN
    ALTER TABLE welfare_cases ADD COLUMN tenant_id TEXT;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'welfare_finance' AND column_name = 'tenant_id') THEN
    ALTER TABLE welfare_finance ADD COLUMN tenant_id TEXT;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ministries' AND column_name = 'tenant_id') THEN
    ALTER TABLE ministries ADD COLUMN tenant_id TEXT;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ministry_finance' AND column_name = 'tenant_id') THEN
    ALTER TABLE ministry_finance ADD COLUMN tenant_id TEXT;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contributions' AND column_name = 'tenant_id') THEN
    ALTER TABLE contributions ADD COLUMN tenant_id TEXT;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'budgets' AND column_name = 'tenant_id') THEN
    ALTER TABLE budgets ADD COLUMN tenant_id TEXT;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finance_approvals' AND column_name = 'tenant_id') THEN
    ALTER TABLE finance_approvals ADD COLUMN tenant_id TEXT;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── Verify ──────────────────────────────────────────────────────────────────
SELECT 'Migration complete! anon RLS policies added for attendance, finance, welfare, ministries, contributions, budgets, finance_approvals.' as result;
