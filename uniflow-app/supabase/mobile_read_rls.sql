-- Mobile read access for lecturers and students.
-- Run in Supabase SQL Editor after courses_rls.sql.
-- Web admin writes via university_admin session or service role; the app reads with lecturer/student JWT.

-- ── lecturer_courses ─────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Lecturers read own lecturer_courses" ON lecturer_courses;
DROP POLICY IF EXISTS "Students read lecturer_courses for enrolled courses" ON lecturer_courses;

CREATE POLICY "Lecturers read own lecturer_courses"
  ON lecturer_courses FOR SELECT TO authenticated
  USING (lecturer_id = auth.uid());

CREATE POLICY "Students read lecturer_courses for enrolled courses"
  ON lecturer_courses FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.course_id = lecturer_courses.course_id
        AND e.student_id = auth.uid()
        AND e.is_active = true
    )
  );

-- ── timetable ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Lecturers read own timetable" ON timetable;
DROP POLICY IF EXISTS "Students read timetable for enrolled courses" ON timetable;

CREATE POLICY "Lecturers read own timetable"
  ON timetable FOR SELECT TO authenticated
  USING (lecturer_id = auth.uid());

CREATE POLICY "Students read timetable for enrolled courses"
  ON timetable FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.course_id = timetable.course_id
        AND e.student_id = auth.uid()
        AND e.is_active = true
    )
  );

-- ── enrollments ──────────────────────────────────────────────────────────────

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students read own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Lecturers read enrollments for assigned courses" ON enrollments;
DROP POLICY IF EXISTS "University admins manage enrollments" ON enrollments;

CREATE POLICY "Students read own enrollments"
  ON enrollments FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Lecturers read enrollments for assigned courses"
  ON enrollments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lecturer_courses lc
      WHERE lc.course_id = enrollments.course_id
        AND lc.lecturer_id = auth.uid()
        AND lc.is_active = true
    )
  );

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

DROP POLICY IF EXISTS "Users read profiles in same university" ON profiles;

CREATE POLICY "Users read profiles in same university"
  ON profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles me
      WHERE me.id = auth.uid()
        AND me.university_id = profiles.university_id
    )
    OR EXISTS (
      SELECT 1 FROM profiles me
      WHERE me.id = auth.uid() AND me.role = 'uniflow_admin'
    )
  );