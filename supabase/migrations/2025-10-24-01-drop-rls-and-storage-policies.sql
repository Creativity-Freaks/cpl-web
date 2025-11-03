-- Migration: Drop RLS and policies for profiles and storage (avatars)
-- WARNING: This will remove row-level security protections. Run only if you
-- understand the security implications and have a backup.

-- 1) Drop all policies in public schema (for tables like profiles)
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT policyname, schemaname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    RAISE NOTICE 'Dropping policy % on %.%...', r.policyname, r.schemaname, r.tablename;
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END
$$;

-- 2) Disable RLS on all public tables
DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    RAISE NOTICE 'Disabling RLS on %.%...', t.schemaname, t.tablename;
    EXECUTE format('ALTER TABLE %I.%I DISABLE ROW LEVEL SECURITY', t.schemaname, t.tablename);
  END LOOP;
END
$$;

-- 3) Drop storage policies (avatars bucket) in storage schema
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT policyname, schemaname, tablename FROM pg_policies WHERE schemaname = 'storage' LOOP
    RAISE NOTICE 'Dropping storage policy % on %.%...', r.policyname, r.schemaname, r.tablename;
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END
$$;

-- 4) Disable RLS on storage.* tables where applicable (objects, buckets)
DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'storage' LOOP
    RAISE NOTICE 'Disabling RLS on %.%...', t.schemaname, t.tablename;
    BEGIN
      EXECUTE format('ALTER TABLE %I.%I DISABLE ROW LEVEL SECURITY', t.schemaname, t.tablename);
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Unable to alter table %.%: %', t.schemaname, t.tablename, SQLERRM;
    END;
  END LOOP;
END
$$;

-- 5) Confirm remaining policies (for auditing)
SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname IN ('public','storage');

-- End of migration
