-- Fix infinite recursion (PostgreSQL 42P17) on profiles RLS.
-- The "Users read profiles in same university" policy queried profiles inside
-- a profiles policy, which re-triggered RLS indefinitely.
-- Run in Supabase SQL Editor (Dashboard → SQL → New query).

-- Helper functions bypass RLS (SECURITY DEFINER) for policy checks.
CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.auth_user_university_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT university_id FROM public.profiles WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.auth_user_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_user_university_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_user_university_id() TO authenticated;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read profiles in same university" ON profiles;
DROP POLICY IF EXISTS "Users read own profile" ON profiles;

CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users read profiles in same university"
  ON profiles FOR SELECT TO authenticated
  USING (
    (
      auth_user_university_id() IS NOT NULL
      AND university_id = auth_user_university_id()
    )
    OR auth_user_role() = 'uniflow_admin'
  );