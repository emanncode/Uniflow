-- RLS for course_offerings + updated policies for offering-based reads.
-- Run AFTER course_offerings_migration.sql
-- Also ensure `class_updates_migration.sql` has been run (it adds the timetable_id column used in policies below).

-- ── Helper: check if auth user is enrolled (bypasses RLS to avoid recursion) ──
CREATE OR REPLACE FUNCTION public.check_student_enrolled(target_course_offering_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e.course_offering_id = target_course_offering_id
      AND e.student_id = auth.uid()
      AND e.is_active = true
  );
$$;

-- ── Helper: check if auth user is the lecturer on the course_offering (bypasses RLS) ──
CREATE OR REPLACE FUNCTION public.check_lecturer_offering(target_course_offering_id uuid, target_course_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM course_offerings co
    WHERE co.lecturer_id = auth.uid()
      AND co.is_active = true
      AND (
        (target_course_offering_id IS NOT NULL AND target_course_offering_id = co.id)
        OR (target_course_offering_id IS NULL AND target_course_id = co.course_id)
      )
  );
$$;

-- ── Helper: check if auth user is enrolled (by course_id or offering_id, bypasses RLS) ──
CREATE OR REPLACE FUNCTION public.check_student_enrolled_by_course(target_course_id uuid, target_course_offering_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e.student_id = auth.uid()
      AND e.is_active = true
      AND (
        (target_course_offering_id IS NOT NULL AND e.course_offering_id = target_course_offering_id)
        OR (target_course_offering_id IS NULL AND e.course_id = target_course_id)
      )
  );
$$;

-- ── course_offerings policies ──────────────────────────────────────────────────

ALTER TABLE course_offerings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "University admins manage course_offerings" ON course_offerings;
DROP POLICY IF EXISTS "Lecturers read own course_offerings" ON course_offerings;
DROP POLICY IF EXISTS "Students read enrolled course_offerings" ON course_offerings;

CREATE POLICY "University admins manage course_offerings"
  ON course_offerings FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'university_admin'
        AND p.university_id = course_offerings.university_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'university_admin'
        AND p.university_id = course_offerings.university_id
    )
  );

CREATE POLICY "Lecturers read own course_offerings"
  ON course_offerings FOR SELECT TO authenticated
  USING (lecturer_id = auth.uid());

CREATE POLICY "Students read enrolled course_offerings"
  ON course_offerings FOR SELECT TO authenticated
  USING (check_student_enrolled(id));

-- ── timetable policies ────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Lecturers read own timetable" ON timetable;
DROP POLICY IF EXISTS "Students read timetable for enrolled courses" ON timetable;

CREATE POLICY "Lecturers read own timetable"
  ON timetable FOR SELECT TO authenticated
  USING (
    lecturer_id = auth.uid()
    OR check_lecturer_offering(course_offering_id, course_id)
  );

CREATE POLICY "Students read timetable for enrolled courses"
  ON timetable FOR SELECT TO authenticated
  USING (
    check_student_enrolled_by_course(course_id, course_offering_id)
  );

-- ── enrollments policies ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Lecturers read enrollments for assigned courses" ON enrollments;

CREATE POLICY "Lecturers read enrollments for assigned courses"
  ON enrollments FOR SELECT TO authenticated
  USING (
    check_lecturer_offering(course_offering_id, course_id)
    OR EXISTS (
      SELECT 1 FROM lecturer_courses lc
      WHERE lc.lecturer_id = auth.uid()
        AND lc.is_active = true
        AND lc.course_id = enrollments.course_id
    )
  );

-- ── class_updates: allow students to report status on their enrolled slots ──

DROP POLICY IF EXISTS "Students insert class_updates for enrolled slots" ON class_updates;
DROP POLICY IF EXISTS "Students can update their own class_updates" ON class_updates;

CREATE POLICY "Students insert class_updates for enrolled slots"
  ON class_updates FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM timetable t
      WHERE t.id = class_updates.timetable_id
        AND check_student_enrolled_by_course(t.course_id, t.course_offering_id)
    )
  );

-- Allow the reporter (student or lecturer) to update their own report
-- (extends the lecturer-only one; keep original for lecturers too)
CREATE POLICY "Students can update their own class_updates"
  ON class_updates FOR UPDATE TO authenticated
  USING (reported_by = auth.uid())
  WITH CHECK (reported_by = auth.uid());
