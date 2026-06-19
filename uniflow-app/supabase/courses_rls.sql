-- RLS policies for university admins managing courses, lecturer assignments, and timetable.
-- Run in Supabase SQL Editor if you prefer client-side writes without API routes.

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturer_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;

-- ── courses ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "University admins select courses" ON courses;
DROP POLICY IF EXISTS "University admins insert courses" ON courses;
DROP POLICY IF EXISTS "University admins update courses" ON courses;

CREATE POLICY "University admins select courses"
  ON courses FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.university_id = courses.university_id
        AND p.role IN ('university_admin', 'dean', 'hod', 'lecturer', 'student')
    )
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'uniflow_admin'
    )
  );

CREATE POLICY "University admins insert courses"
  ON courses FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN departments d ON d.id = courses.department_id
      WHERE p.id = auth.uid()
        AND p.role = 'university_admin'
        AND p.university_id = courses.university_id
        AND d.university_id = courses.university_id
    )
  );

CREATE POLICY "University admins update courses"
  ON courses FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'university_admin'
        AND p.university_id = courses.university_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'university_admin'
        AND p.university_id = courses.university_id
    )
  );

-- ── lecturer_courses ─────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "University admins manage lecturer_courses" ON lecturer_courses;

CREATE POLICY "University admins manage lecturer_courses"
  ON lecturer_courses FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'university_admin'
        AND p.university_id = lecturer_courses.university_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'university_admin'
        AND p.university_id = lecturer_courses.university_id
    )
  );

-- ── timetable ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "University admins manage timetable" ON timetable;

CREATE POLICY "University admins manage timetable"
  ON timetable FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'university_admin'
        AND p.university_id = timetable.university_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'university_admin'
        AND p.university_id = timetable.university_id
    )
  );