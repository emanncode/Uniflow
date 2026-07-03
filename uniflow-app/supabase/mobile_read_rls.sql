-- Mobile read access for lecturers and students.
-- Run in Supabase SQL Editor after courses_rls.sql.
-- IMPORTANT: Run `class_updates_migration.sql` first if you get "column class_updates.timetable_id does not exist".
-- Web admin writes via university_admin session or service role; the app reads with lecturer/student JWT.

-- ── SECURITY DEFINER helpers to prevent RLS recursion (42P17) ─────────────────
-- These are used to safely check enrollments without triggering policy cycles
-- between enrollments <-> lecturer_courses <-> etc.

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

REVOKE ALL ON FUNCTION public.auth_student_enrolled_course_ids() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_student_enrolled_course_ids() FROM anon;
GRANT EXECUTE ON FUNCTION public.auth_student_enrolled_course_ids() TO authenticated;

CREATE OR REPLACE FUNCTION public.auth_lecturer_course_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT course_id FROM lecturer_courses
  WHERE lecturer_id = auth.uid()
    AND is_active = true;
$$;

REVOKE ALL ON FUNCTION public.auth_lecturer_course_ids() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_lecturer_course_ids() FROM anon;
GRANT EXECUTE ON FUNCTION public.auth_lecturer_course_ids() TO authenticated;

-- ── lecturer_courses ─────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Lecturers read own lecturer_courses" ON lecturer_courses;
DROP POLICY IF EXISTS "Students read lecturer_courses for enrolled courses" ON lecturer_courses;

CREATE POLICY "Lecturers read own lecturer_courses"
  ON lecturer_courses FOR SELECT TO authenticated
  USING (lecturer_id = auth.uid());

-- Use helper (SECURITY DEFINER) to avoid recursion with enrollments policies
CREATE POLICY "Students read lecturer_courses for enrolled courses"
  ON lecturer_courses FOR SELECT TO authenticated
  USING (course_id IN (SELECT auth_student_enrolled_course_ids()));

-- ── timetable ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Lecturers read own timetable" ON timetable;
DROP POLICY IF EXISTS "Students read timetable for enrolled courses" ON timetable;

CREATE POLICY "Lecturers read own timetable"
  ON timetable FOR SELECT TO authenticated
  USING (lecturer_id = auth.uid());

-- Use helper (SECURITY DEFINER) to avoid recursion with enrollments/lecturer_courses
CREATE POLICY "Students read timetable for enrolled courses"
  ON timetable FOR SELECT TO authenticated
  USING (course_id IN (SELECT auth_student_enrolled_course_ids()));

-- ── enrollments ──────────────────────────────────────────────────────────────

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students read own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Lecturers read enrollments for assigned courses" ON enrollments;
DROP POLICY IF EXISTS "University admins manage enrollments" ON enrollments;

CREATE POLICY "Students read own enrollments"
  ON enrollments FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- Use helper (SECURITY DEFINER) to avoid triggering RLS on lecturer_courses
CREATE POLICY "Lecturers read enrollments for assigned courses"
  ON enrollments FOR SELECT TO authenticated
  USING (course_id IN (SELECT auth_lecturer_course_ids()));

CREATE POLICY "University admins manage enrollments"
  ON enrollments FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'university_admin'
        AND p.university_id = enrollments.university_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'university_admin'
        AND p.university_id = enrollments.university_id
    )
  );

-- ── class_updates ────────────────────────────────────────────────────────────

ALTER TABLE class_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "University members read class_updates" ON class_updates;
DROP POLICY IF EXISTS "Lecturers insert class_updates for own slots" ON class_updates;
DROP POLICY IF EXISTS "Lecturers update own class_updates" ON class_updates;
DROP POLICY IF EXISTS "University admins manage class_updates" ON class_updates;

CREATE POLICY "University members read class_updates"
  ON class_updates FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.university_id = class_updates.university_id
    )
  );

CREATE POLICY "Lecturers insert class_updates for own slots"
  ON class_updates FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM timetable t
      WHERE t.id = class_updates.timetable_id
        AND t.lecturer_id = auth.uid()
    )
  );

CREATE POLICY "Lecturers update own class_updates"
  ON class_updates FOR UPDATE TO authenticated
  USING (reported_by = auth.uid())
  WITH CHECK (reported_by = auth.uid());

CREATE POLICY "University admins manage class_updates"
  ON class_updates FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'university_admin'
        AND p.university_id = class_updates.university_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'university_admin'
        AND p.university_id = class_updates.university_id
    )
  );

-- ── profiles (for lecturer name joins in timetable/courses) ──────────────────
-- Uses SECURITY DEFINER helpers to avoid infinite RLS recursion (42P17).
-- See profiles_rls_fix.sql if these functions are not yet deployed.

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