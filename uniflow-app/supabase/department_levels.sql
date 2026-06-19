-- Department max level + student study level
-- Run in Supabase SQL editor

ALTER TABLE departments
ADD COLUMN IF NOT EXISTS max_course_level smallint
CHECK (max_course_level IS NULL OR max_course_level IN (400, 500));

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS level smallint
CHECK (level IS NULL OR level IN (100, 200, 300, 400, 500));

COMMENT ON COLUMN departments.max_course_level IS
  'Highest level for this department: 400 (undergrad) or 500 (includes postgrad). Set once on first student setup.';

COMMENT ON COLUMN profiles.level IS
  'Student study level (100–500). Set when admin registers the student.';