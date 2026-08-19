-- ─────────────────────────────────────────────────────────────────────────────
-- Paradise AG — Supabase Data Backfill (Part 4)
-- Run this in the Supabase Dashboard → SQL Editor → New query → Paste → Run
--
-- Diagnostic query results confirmed these 9 tables have BOTH tenant_id and
-- church_id columns. tenant_id was added later (by the RLS migrations) as a
-- bare ADD COLUMN with no backfill, so existing rows likely have their real
-- data under church_id while tenant_id is NULL.
--
-- The Flutter app's SyncService.fetchTable/pullRemoteChanges try tenant_id
-- FIRST and return immediately on any successful query — even if it returns
-- zero rows — so these tables would silently show no data even though RLS
-- is now correctly configured (fixed in part2/part3).
--
-- This backfills tenant_id from church_id for existing rows, so future reads
-- (which correctly prefer tenant_id) find the data. This is idempotent and
-- safe to run multiple times.
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE budgets SET tenant_id = church_id WHERE tenant_id IS NULL AND church_id IS NOT NULL;
UPDATE contributions SET tenant_id = church_id WHERE tenant_id IS NULL AND church_id IS NOT NULL;
UPDATE finance_approvals SET tenant_id = church_id WHERE tenant_id IS NULL AND church_id IS NOT NULL;
UPDATE ministries SET tenant_id = church_id WHERE tenant_id IS NULL AND church_id IS NOT NULL;
UPDATE ministry_finance SET tenant_id = church_id WHERE tenant_id IS NULL AND church_id IS NOT NULL;
UPDATE sermons SET tenant_id = church_id WHERE tenant_id IS NULL AND church_id IS NOT NULL;
UPDATE transactions SET tenant_id = church_id WHERE tenant_id IS NULL AND church_id IS NOT NULL;
UPDATE welfare_cases SET tenant_id = church_id WHERE tenant_id IS NULL AND church_id IS NOT NULL;
UPDATE welfare_finance SET tenant_id = church_id WHERE tenant_id IS NULL AND church_id IS NOT NULL;

-- ── Verify: count of rows that now have tenant_id populated ──────────────────
SELECT 'budgets' AS table_name, COUNT(*) AS rows_with_tenant_id FROM budgets WHERE tenant_id IS NOT NULL
UNION ALL
SELECT 'contributions', COUNT(*) FROM contributions WHERE tenant_id IS NOT NULL
UNION ALL
SELECT 'finance_approvals', COUNT(*) FROM finance_approvals WHERE tenant_id IS NOT NULL
UNION ALL
SELECT 'ministries', COUNT(*) FROM ministries WHERE tenant_id IS NOT NULL
UNION ALL
SELECT 'ministry_finance', COUNT(*) FROM ministry_finance WHERE tenant_id IS NOT NULL
UNION ALL
SELECT 'sermons', COUNT(*) FROM sermons WHERE tenant_id IS NOT NULL
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions WHERE tenant_id IS NOT NULL
UNION ALL
SELECT 'welfare_cases', COUNT(*) FROM welfare_cases WHERE tenant_id IS NOT NULL
UNION ALL
SELECT 'welfare_finance', COUNT(*) FROM welfare_finance WHERE tenant_id IS NOT NULL;
