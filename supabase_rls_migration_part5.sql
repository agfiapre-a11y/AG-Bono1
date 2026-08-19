-- ─────────────────────────────────────────────────────────────────────────────
-- Supabase RLS Migration Part 5: Fix churches table + ensure ParadiseAg data
-- ─────────────────────────────────────────────────────────────────────────────
-- Run this in the Supabase SQL Editor.
--
-- 1. Adds anon_all policy to the churches table (was missing in parts 1-4).
--    Without this, the Flutter app (using the anon key) gets 401 when trying
--    to insert/upsert into churches, which blocks branches, departments,
--    ministries, etc. (they have FK to churches.id).
--
-- 2. Inserts ParadiseAg into the churches table using the same ID as the
--    tenants table, so both tenant_id and church_id FKs resolve to the
--    same church.
--
-- 3. Fixes active_role=null for all users (sets it to the role value).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Add anon policy to churches table ────────────────────────────────────
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_churches" ON churches;
CREATE POLICY "anon_all_churches" ON churches
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

-- ── 2. Insert ParadiseAg into churches table ────────────────────────────────
-- Uses the same UUID as the tenants table so both FK systems work.
INSERT INTO churches (id, name, email, phone, address, description, logo_url, created_at, updated_at)
VALUES (
  'a2cdda2c-37f4-4436-b215-916e5cec2952',
  'ParadiseAg',
  'paradise@ag.org',
  '22222225',
  'fiapre sunyani',
  '',
  '',
  '2026-07-30T15:12:22.17037Z',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  updated_at = NOW();

-- ── 3. Fix active_role=null for all users ───────────────────────────────────
-- Set active_role = role where active_role is null.
UPDATE users SET active_role = role WHERE active_role IS NULL;

-- ── 4. Verify ───────────────────────────────────────────────────────────────
-- Check churches table
SELECT 'churches' AS table_name, count(*) AS row_count FROM churches
UNION ALL
SELECT 'tenants', count(*) FROM tenants
UNION ALL
SELECT 'users', count(*) FROM users
UNION ALL
SELECT 'users_with_active_role_null', count(*) FROM users WHERE active_role IS NULL;

-- Check ParadiseAg in both tables (cast UUID to text so UNION types match)
SELECT 'churches' AS source, id::text AS id, name FROM churches WHERE id = 'a2cdda2c-37f4-4436-b215-916e5cec2952'
UNION ALL
SELECT 'tenants', id::text, name FROM tenants WHERE id = 'a2cdda2c-37f4-4436-b215-916e5cec2952';

-- Check all users for ParadiseAg tenant
SELECT id, name, email, role, active_role, tenant_id
FROM users
WHERE tenant_id = 'a2cdda2c-37f4-4436-b215-916e5cec2952'
ORDER BY name;
