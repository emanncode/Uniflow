-- Add department_id to timetable and link it to departments.
-- Safe to re-run.

-- 1. Add column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'timetable'
      AND column_name = 'department_id'
  ) THEN
    ALTER TABLE public.timetable
      ADD COLUMN department_id uuid;
  END IF;
END $$;

-- 2. Backfill from courses for existing slots
UPDATE public.timetable t
SET department_id = c.department_id
FROM public.courses c
WHERE t.course_id = c.id
  AND t.department_id IS NULL
  AND c.department_id IS NOT NULL;

-- 3. Add foreign key if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'timetable_department_id_fkey'
  ) THEN
    ALTER TABLE public.timetable
      ADD CONSTRAINT timetable_department_id_fkey
      FOREIGN KEY (department_id)
      REFERENCES public.departments(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Index for department-scoped timetable queries
CREATE INDEX IF NOT EXISTS timetable_department_id_idx
  ON public.timetable (department_id);