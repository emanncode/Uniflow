-- Add missing columns to university_registrations

ALTER TABLE university_registrations
  ADD COLUMN IF NOT EXISTS contact_person_name text,
  ADD COLUMN IF NOT EXISTS contact_person_role text,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- Backfill created_at for existing rows
UPDATE university_registrations SET created_at = now() WHERE created_at IS NULL;
