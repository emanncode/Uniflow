-- Course Offering hub: links catalog courses to lecturers per session,
-- timetable slots, and student enrollments.
-- Run in Supabase SQL Editor AFTER existing schema is in place.

-- ── course_offerings ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS course_offerings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lecturer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  department_id uuid NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  university_id uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  academic_session text NOT NULL,
  semester smallint NOT NULL CHECK (semester IN (1, 2)),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, lecturer_id, academic_session, semester)
);

CREATE INDEX IF NOT EXISTS idx_course_offerings_dept_session
  ON course_offerings (department_id, academic_session, semester)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_course_offerings_lecturer
  ON course_offerings (lecturer_id, academic_session, semester)
  WHERE is_active = true;

-- ── timetable.course_offering_id ─────────────────────────────────────────────

ALTER TABLE timetable
  ADD COLUMN IF NOT EXISTS course_offering_id uuid REFERENCES course_offerings(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_timetable_offering
  ON timetable (course_offering_id)
  WHERE is_active = true;

-- ── enrollments.course_offering_id ───────────────────────────────────────────

ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS course_offering_id uuid REFERENCES course_offerings(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_enrollments_offering
  ON enrollments (course_offering_id)
  WHERE is_active = true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_student_offering_unique
  ON enrollments (student_id, course_offering_id)
  WHERE course_offering_id IS NOT NULL AND is_active = true;

-- ── Backfill from lecturer_courses ───────────────────────────────────────────

INSERT INTO course_offerings (
  course_id,
  lecturer_id,
  department_id,
  university_id,
  academic_session,
  semester,
  is_active
)
SELECT
  lc.course_id,
  lc.lecturer_id,
  c.department_id,
  c.university_id,
  lc.academic_session,
  lc.semester,
  lc.is_active
FROM lecturer_courses lc
JOIN courses c ON c.id = lc.course_id
WHERE NOT EXISTS (
  SELECT 1 FROM course_offerings co
  WHERE co.course_id = lc.course_id
    AND co.lecturer_id = lc.lecturer_id
    AND co.academic_session = lc.academic_session
    AND co.semester = lc.semester
);

-- Backfill timetable.course_offering_id
UPDATE timetable t
SET course_offering_id = co.id
FROM course_offerings co
WHERE t.course_offering_id IS NULL
  AND t.course_id = co.course_id
  AND t.lecturer_id = co.lecturer_id
  AND t.academic_session = co.academic_session
  AND t.semester = co.semester;

-- Backfill enrollments.course_offering_id (first matching offering per course)
UPDATE enrollments e
SET course_offering_id = co.id
FROM course_offerings co
WHERE e.course_offering_id IS NULL
  AND e.course_id = co.course_id
  AND e.academic_session = co.academic_session
  AND e.semester = co.semester
  AND co.is_active = true;