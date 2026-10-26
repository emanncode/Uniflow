-- Compatibility columns selected by the mobile class-updates queries.
-- The app currently writes attribution to reported_by and does not write
-- new_end_time, so these columns remain nullable and are safe for existing rows.

ALTER TABLE public.class_updates
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS new_end_time text;

COMMENT ON COLUMN public.class_updates.created_by IS
  'Legacy mobile query compatibility field; reported_by is the current writer field.';

COMMENT ON COLUMN public.class_updates.new_end_time IS
  'Optional relocated class end time selected by mobile clients.';

NOTIFY pgrst, 'reload schema';
