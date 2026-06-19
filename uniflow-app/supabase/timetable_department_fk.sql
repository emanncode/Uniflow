-- Optional: add FK so PostgREST can embed departments on timetable queries.
-- Run in Supabase SQL Editor if you want DB-level relationship support.

ALTER TABLE timetable
  ADD COLUMN IF NOT EXISTS department_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'timetable_department_id_fkey'
  ) THEN
    ALTER TABLE timetable
      ADD CONSTRAINT timetable_department_id_fkey
      FOREIGN KEY (department_id) REFERENCES departments(id)
      ON DELETE SET NULL;
  END IF;
END $$;