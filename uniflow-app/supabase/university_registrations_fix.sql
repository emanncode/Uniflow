-- Full fix: add ALL columns university_registrations needs

ALTER TABLE university_registrations
  ADD COLUMN IF NOT EXISTS university_name text,
  ADD COLUMN IF NOT EXISTS short_name text,
  ADD COLUMN IF NOT EXISTS official_email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS estimated_students integer,
  ADD COLUMN IF NOT EXISTS contact_person_name text,
  ADD COLUMN IF NOT EXISTS contact_person_role text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- Ensure created_at has a default
ALTER TABLE university_registrations
  ALTER COLUMN created_at SET DEFAULT now();

-- Add unique constraint for short_name if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'university_registrations_short_name_key'
  ) THEN
    ALTER TABLE university_registrations ADD CONSTRAINT university_registrations_short_name_key UNIQUE (short_name);
  END IF;
END;
$$;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- RLS policies
ALTER TABLE university_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert registrations" ON university_registrations;
DROP POLICY IF EXISTS "Uniflow admins select" ON university_registrations;
DROP POLICY IF EXISTS "Uniflow admins update" ON university_registrations;

CREATE POLICY "Public insert registrations"
  ON university_registrations FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Uniflow admins select"
  ON university_registrations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'uniflow_admin'
    )
  );

CREATE POLICY "Uniflow admins update"
  ON university_registrations FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'uniflow_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'uniflow_admin'
    )
  );
