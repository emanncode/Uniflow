-- RLS for university_registrations
-- Allows public INSERT (registration), uniflow_admin SELECT/UPDATE

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
