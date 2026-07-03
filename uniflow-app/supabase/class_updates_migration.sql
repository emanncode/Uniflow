-- class_updates: per-day status / reports on timetable slots (ongoing, delayed, canceled, etc.)
-- Run this BEFORE mobile_read_rls.sql and course_offerings_rls_clean.sql
-- if you get "column class_updates.timetable_id does not exist"
-- if you get "Could not find the 'delay_minutes' column of 'class_updates' in the schema cache" (or similar) -- re-run this migration.
-- if you get 'null value in column "title" ... violates not-null constraint' -- re-run this migration (it now ensures the title column).

-- Create the table if it does not exist at all
CREATE TABLE IF NOT EXISTS class_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_id uuid NOT NULL REFERENCES timetable(id) ON DELETE CASCADE,
  reported_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  university_id uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  status text NOT NULL,
  title text NOT NULL,
  message text,
  new_venue text,
  new_start_time text,
  delay_minutes integer,
  upvotes integer NOT NULL DEFAULT 0,
  is_verified boolean NOT NULL DEFAULT false,
  update_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- If the table already existed but was missing columns (common cause of 42703 / PGRST204 schema cache errors)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'class_updates' 
      AND column_name = 'timetable_id'
  ) THEN
    ALTER TABLE public.class_updates
      ADD COLUMN timetable_id uuid REFERENCES timetable(id) ON DELETE CASCADE;
  END IF;

  -- Add other core columns defensively if someone created a minimal/older table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'class_updates' AND column_name = 'university_id'
  ) THEN
    ALTER TABLE public.class_updates ADD COLUMN university_id uuid REFERENCES universities(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'class_updates' AND column_name = 'reported_by'
  ) THEN
    ALTER TABLE public.class_updates ADD COLUMN reported_by uuid REFERENCES profiles(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'class_updates' AND column_name = 'update_date'
  ) THEN
    ALTER TABLE public.class_updates ADD COLUMN update_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'class_updates' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.class_updates ADD COLUMN status text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'class_updates' AND column_name = 'title'
  ) THEN
    -- title was added later; use DEFAULT '' so any pre-existing rows don't violate NOT NULL
    ALTER TABLE public.class_updates ADD COLUMN title text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'class_updates' AND column_name = 'message'
  ) THEN
    ALTER TABLE public.class_updates ADD COLUMN message text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'class_updates' AND column_name = 'new_venue'
  ) THEN
    ALTER TABLE public.class_updates ADD COLUMN new_venue text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'class_updates' AND column_name = 'new_start_time'
  ) THEN
    ALTER TABLE public.class_updates ADD COLUMN new_start_time text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'class_updates' AND column_name = 'delay_minutes'
  ) THEN
    ALTER TABLE public.class_updates ADD COLUMN delay_minutes integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'class_updates' AND column_name = 'upvotes'
  ) THEN
    ALTER TABLE public.class_updates ADD COLUMN upvotes integer NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'class_updates' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE public.class_updates ADD COLUMN is_verified boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'class_updates' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.class_updates ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

-- Indexes for the queries we actually run (by uni + date + in(timetable_ids))
CREATE INDEX IF NOT EXISTS idx_class_updates_university_id
  ON public.class_updates (university_id);

CREATE INDEX IF NOT EXISTS idx_class_updates_timetable_id
  ON public.class_updates (timetable_id);

CREATE INDEX IF NOT EXISTS idx_class_updates_update_date
  ON public.class_updates (update_date);

-- One report per slot per day is the common pattern used by the app
CREATE UNIQUE INDEX IF NOT EXISTS idx_class_updates_timetable_update_date
  ON public.class_updates (timetable_id, update_date);

-- Enable RLS (policies are defined in mobile_read_rls.sql and course_offerings_rls_clean.sql)
ALTER TABLE class_updates ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE class_updates IS 'Daily class status reports/updates attached to timetable slots. Used for live "ongoing / delayed / canceled" info on mobile.';

-- Force PostgREST to reload its schema cache so that any newly added columns (e.g. delay_minutes)
-- are immediately visible. Run this migration in the Supabase SQL editor; the NOTIFY will take effect.
NOTIFY pgrst, 'reload schema';
