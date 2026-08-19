-- ─────────────────────────────────────────────────────────────────────────────
-- Paradise AG — Supabase RLS Migration (Part 3)
-- Run this in the Supabase Dashboard → SQL Editor → New query → Paste → Run
--
-- access_control_migration.sql set up RLS policies on access_grants and
-- access_activities that rely on auth.uid() (e.g. "user_id = auth.uid()::text").
-- Since the Flutter app only ever uses the Supabase anon key (it authenticates
-- against the NestJS backend / local auth, not Supabase Auth), auth.uid() is
-- always NULL for these requests — so every one of those policies evaluates
-- to false and silently blocks all access, exactly like the other tables
-- fixed in part2.
--
-- This replaces those auth.uid()-based policies with the same simple
-- "anon, authenticated USING (true)" pattern used everywhere else in this
-- offline-first app (tenant scoping is enforced client-side by the Flutter
-- app, same as every other table).
-- ─────────────────────────────────────────────────────────────────────────────

-- access_grants
DROP POLICY IF EXISTS "users_read_own_grants" ON access_grants;
DROP POLICY IF EXISTS "admins_manage_grants" ON access_grants;
DROP POLICY IF EXISTS "anon_all_access_grants" ON access_grants;
CREATE POLICY "anon_all_access_grants" ON access_grants FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- access_activities
DROP POLICY IF EXISTS "users_read_activities" ON access_activities;
DROP POLICY IF EXISTS "users_insert_activities" ON access_activities;
DROP POLICY IF EXISTS "anon_all_access_activities" ON access_activities;
CREATE POLICY "anon_all_access_activities" ON access_activities FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ── Verify ──────────────────────────────────────────────────────────────────
SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('access_grants', 'access_activities')
ORDER BY tablename;
