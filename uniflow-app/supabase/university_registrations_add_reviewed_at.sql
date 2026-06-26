ALTER TABLE university_registrations
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
