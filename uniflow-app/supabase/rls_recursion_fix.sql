-- Fix infinite recursion (PostgreSQL 42P17) between enrollments ←↔ course_offerings.
--
-- Cycle traced:
--   timetable."Students read timetable for enrolled courses" → enrollments (RLS)
--   → enrollments."Lecturers read enrollments for assigned courses" → course_offerings (RLS)
--   → course_offerings."Students read enrolled course_offerings" → enrollments (RLS) → ∞
--
-- Fix: SECURITY DEFINER helper so the policy on course_offerings never re-triggers RLS on enrollments.
-- Run in Supabase SQL Editor.

-- ── SECURITY DEFINER helpers (bypass RLS) ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.auth_student_enrolled_course_offering_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT course_offering_id FROM enrollments
  WHERE student_id = auth.uid()
    AND is_active = true
    AND course_offering_id IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.auth_student_enrolled_course_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT course_id FROM enrollments
  WHERE student_id = auth.uid()
    AND is_active = true;
$$;

REVOKE ALL ON FUNCTION public.auth_student_enrolled_course_offering_ids() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_student_enrolled_course_offering_ids() FROM anon;
GRANT EXECUTE ON FUNCTION public.auth_student_enrolled_course_offering_ids() TO authenticated;

REVOKE ALL ON FUNCTION public.auth_student_enrolled_course_ids() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_student_enrolled_course_ids() FROM anon;
GRANT EXECUTE ON FUNCTION public.auth_student_enrolled_course_ids() TO authenticated;

-- ── Fix course_offerings (drop recursive policy, recreate with SECURITY DEFINER) ─

DROP POLICY IF EXISTS "Students read enrolled course_offerings" ON course_offerings;

CREATE POLICY "Students read enrolled course_offerings"
  ON course_offerings FOR SELECT TO authenticated
  USING (id IN (SELECT auth_student_enrolled_course_offering_ids()));

-- ── Fix lecturer_courses (same cycle pattern) ─────────────────────────────────

DROP POLICY IF EXISTS "Students read lecturer_courses for enrolled courses" ON lecturer_courses;

CREATE POLICY "Students read lecturer_courses for enrolled courses"
  ON lecturer_courses FOR SELECT TO authenticated
  USING (course_id IN (SELECT auth_student_enrolled_course_ids()));
