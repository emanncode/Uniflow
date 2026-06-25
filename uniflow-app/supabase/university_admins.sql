-- Create dedicated university_admins table and migrate existing admins from profiles.role.
-- Run AFTER all existing migration files.
-- This replaces `profiles.role = 'university_admin'` as the source of truth for authorization.

-- ── Create table ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS university_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(user_id, university_id)
);

-- ── Migrate existing admins ───────────────────────────────────────────────────

INSERT INTO university_admins (user_id, university_id)
SELECT p.id, p.university_id
FROM profiles p
WHERE p.role = 'university_admin'
  AND p.university_id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE university_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own university_admin record" ON university_admins;
CREATE POLICY "Users read own university_admin record"
  ON university_admins FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Uniflow admins manage university_admins" ON university_admins;
CREATE POLICY "Uniflow admins manage university_admins"
  ON university_admins FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'uniflow_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'uniflow_admin'
    )
  );

-- ── Update existing RLS policies to use university_admins ─────────────────────

-- courses (replaces courses_rls.sql checks)
DROP POLICY IF EXISTS "University admins insert courses" ON courses;
CREATE POLICY "University admins insert courses"
  ON courses FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM university_admins ua
      JOIN departments d ON d.id = courses.department_id
      WHERE ua.user_id = auth.uid()
        AND ua.university_id = courses.university_id
        AND d.university_id = courses.university_id
    )
  );

DROP POLICY IF EXISTS "University admins update courses" ON courses;
CREATE POLICY "University admins update courses"
  ON courses FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM university_admins ua
      WHERE ua.user_id = auth.uid()
        AND ua.university_id = courses.university_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM university_admins ua
      WHERE ua.user_id = auth.uid()
        AND ua.university_id = courses.university_id
    )
  );

-- lecturer_courses (replaces courses_rls.sql checks)
DROP POLICY IF EXISTS "University admins manage lecturer_courses" ON lecturer_courses;
CREATE POLICY "University admins manage lecturer_courses"
  ON lecturer_courses FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM university_admins ua
      WHERE ua.user_id = auth.uid()
        AND ua.university_id = lecturer_courses.university_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM university_admins ua
      WHERE ua.user_id = auth.uid()
        AND ua.university_id = lecturer_courses.university_id
    )
  );

-- timetable (replaces courses_rls.sql checks)
DROP POLICY IF EXISTS "University admins manage timetable" ON timetable;
CREATE POLICY "University admins manage timetable"
  ON timetable FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM university_admins ua
      WHERE ua.user_id = auth.uid()
        AND ua.university_id = timetable.university_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM university_admins ua
      WHERE ua.user_id = auth.uid()
        AND ua.university_id = timetable.university_id
    )
  );

-- enrollments (replaces mobile_read_rls.sql check)
DROP POLICY IF EXISTS "University admins manage enrollments" ON enrollments;
CREATE POLICY "University admins manage enrollments"
  ON enrollments FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM university_admins ua
      WHERE ua.user_id = auth.uid()
        AND ua.university_id = enrollments.university_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM university_admins ua
      WHERE ua.user_id = auth.uid()
        AND ua.university_id = enrollments.university_id
    )
  );

-- class_updates (replaces mobile_read_rls.sql check)
DROP POLICY IF EXISTS "University admins manage class_updates" ON class_updates;
CREATE POLICY "University admins manage class_updates"
  ON class_updates FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM university_admins ua
      WHERE ua.user_id = auth.uid()
        AND ua.university_id = class_updates.university_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM university_admins ua
      WHERE ua.user_id = auth.uid()
        AND ua.university_id = class_updates.university_id
    )
  );

-- course_offerings (replaces course_offerings_rls.sql check)
DROP POLICY IF EXISTS "University admins manage course_offerings" ON course_offerings;
CREATE POLICY "University admins manage course_offerings"
  ON course_offerings FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM university_admins ua
      WHERE ua.user_id = auth.uid()
        AND ua.university_id = course_offerings.university_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM university_admins ua
      WHERE ua.user_id = auth.uid()
        AND ua.university_id = course_offerings.university_id
    )
  );

-- resources (university admins manage all resources in their university)
DROP POLICY IF EXISTS "University admins manage resources" ON resources;
CREATE POLICY "University admins manage resources"
  ON resources FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM university_admins ua
      WHERE ua.user_id = auth.uid()
        AND ua.university_id = resources.university_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM university_admins ua
      WHERE ua.user_id = auth.uid()
        AND ua.university_id = resources.university_id
    )
  );
