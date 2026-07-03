-- RLS for course_offerings + updated policies for offering-based reads.
-- Run AFTER course_offerings_migration.sql
-- Also ensure `class_updates_migration.sql` has been run (it adds the timetable_id column used in policies below).
-- Re-run this file (and/or mobile_read_rls.sql) if students lose access to courses/timetable
-- or get RLS errors (42501) when reporting/confirming class status.

-- ── Helper: check if auth user is enrolled (bypasses RLS to avoid recursion) ──
CREATE OR REPLACE FUNCTION public.check_student_enrolled(target_course_offering_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e.course_offering_id = target_course_offering_id
      AND e.student_id = auth.uid()
      AND e.is_active = true
  )
  -- Fallback when no active enrollments: allow offerings whose course matches level+uni
  OR (
    target_course_offering_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM enrollments e2 WHERE e2.student_id = auth.uid() AND e2.is_active = true
    )
    AND EXISTS (
      SELECT 1 FROM course_offerings co
      JOIN courses c ON c.id = co.course_id
      JOIN profiles p ON p.id = auth.uid()
      WHERE co.id = target_course_offering_id
        AND p.level IS NOT NULL
        AND c.level = p.level
        AND c.university_id = p.university_id
    )
  );
$$;

-- ── Helper: check if auth user is the lecturer on the course_offering (bypasses RLS) ──
CREATE OR REPLACE FUNCTION public.check_lecturer_offering(target_course_offering_id uuid, target_course_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM course_offerings co
    WHERE co.lecturer_id = auth.uid()
      AND co.is_active = true
      AND (
        (target_course_offering_id IS NOT NULL AND target_course_offering_id = co.id)
        OR (target_course_offering_id IS NULL AND target_course_id = co.course_id)
      )
  );
$$;

-- ── Helper: check if auth user is enrolled (by course_id or offering_id, bypasses RLS) ──
CREATE OR REPLACE FUNCTION public.check_student_enrolled_by_course(target_course_id uuid, target_course_offering_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e.student_id = auth.uid()
      AND e.is_active = true
      AND (
        -- Match on offering if provided (for specific section)
        (target_course_offering_id IS NOT NULL AND e.course_offering_id = target_course_offering_id)
        -- Or always allow if course_id matches (handles legacy data, backfill mismatches,
        -- or when timetable/enrollment use course-level linking).
        OR e.course_id = target_course_id
      )
  )
  -- Fallback (no active enrollments at all): allow level + uni matched courses
  -- (keeps timetable visible for testing / incomplete enrollments, matches auth_* helpers)
  OR (
    NOT EXISTS (
      SELECT 1 FROM enrollments e2
      WHERE e2.student_id = auth.uid() AND e2.is_active = true
    )
    AND EXISTS (
      SELECT 1 FROM courses c
      JOIN profiles p ON p.id = auth.uid()
      WHERE c.id = target_course_id
        AND p.level IS NOT NULL
        AND c.level = p.level
        AND c.university_id = p.university_id
    )
  );
$$;

-- ── RPC for safe community upvoting of class status reports (bypasses strict "own reporter" update RLS) ──
-- Any student enrolled in the slot (per check_student_enrolled_by_course) can increment the counter.
CREATE OR REPLACE FUNCTION public.upvote_class_update(p_update_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_timetable_id uuid;
BEGIN
  SELECT timetable_id INTO v_timetable_id
  FROM class_updates
  WHERE id = p_update_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'class_update not found';
  END IF;

  -- Authorization: must be enrolled for that timetable slot (same logic as insert/report)
  IF NOT EXISTS (
    SELECT 1
    FROM timetable t
    WHERE t.id = v_timetable_id
      AND check_student_enrolled_by_course(t.course_id, t.course_offering_id)
  ) THEN
    RAISE EXCEPTION 'Not authorized to upvote this class update';
  END IF;

  UPDATE class_updates
  SET upvotes = upvotes + 1
  WHERE id = p_update_id;
END;
$$;

REVOKE ALL ON FUNCTION public.upvote_class_update(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.upvote_class_update(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.upvote_class_update(uuid) TO authenticated;

-- ── course_offerings policies ──────────────────────────────────────────────────

ALTER TABLE course_offerings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "University admins manage course_offerings" ON course_offerings;
DROP POLICY IF EXISTS "Lecturers read own course_offerings" ON course_offerings;
DROP POLICY IF EXISTS "Students read enrolled course_offerings" ON course_offerings;

CREATE POLICY "University admins manage course_offerings"
  ON course_offerings FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'university_admin'
        AND p.university_id = course_offerings.university_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'university_admin'
        AND p.university_id = course_offerings.university_id
    )
  );

CREATE POLICY "Lecturers read own course_offerings"
  ON course_offerings FOR SELECT TO authenticated
  USING (lecturer_id = auth.uid());

CREATE POLICY "Students read enrolled course_offerings"
  ON course_offerings FOR SELECT TO authenticated
  USING (check_student_enrolled(id));

-- ── timetable policies ────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Lecturers read own timetable" ON timetable;
DROP POLICY IF EXISTS "Students read timetable for enrolled courses" ON timetable;

CREATE POLICY "Lecturers read own timetable"
  ON timetable FOR SELECT TO authenticated
  USING (
    lecturer_id = auth.uid()
    OR check_lecturer_offering(course_offering_id, course_id)
  );

CREATE POLICY "Students read timetable for enrolled courses"
  ON timetable FOR SELECT TO authenticated
  USING (
    check_student_enrolled_by_course(course_id, course_offering_id)
  );

-- ── enrollments policies ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Lecturers read enrollments for assigned courses" ON enrollments;

CREATE POLICY "Lecturers read enrollments for assigned courses"
  ON enrollments FOR SELECT TO authenticated
  USING (
    check_lecturer_offering(course_offering_id, course_id)
    OR course_id IN (SELECT auth_lecturer_course_ids())
  );

-- ── class_updates: allow students to report status on their enrolled slots ──

DROP POLICY IF EXISTS "Students insert class_updates for enrolled slots" ON class_updates;
DROP POLICY IF EXISTS "Students can update their own class_updates" ON class_updates;

CREATE POLICY "Students insert class_updates for enrolled slots"
  ON class_updates FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM timetable t
      WHERE t.id = class_updates.timetable_id
        AND (
          check_student_enrolled_by_course(t.course_id, t.course_offering_id)
          -- Also allow if the student would be allowed to see this timetable slot via
          -- the course_id-based auth helper (covers cases where mobile_read_rls.sql
          -- timetable policy or level-based fallbacks are in effect due to script order).
          OR t.course_id IN (SELECT auth_student_enrolled_course_ids())
        )
    )
  );

-- Allow the reporter (student or lecturer) to update their own report
-- (extends the lecturer-only one; keep original for lecturers too)
CREATE POLICY "Students can update their own class_updates"
  ON class_updates FOR UPDATE TO authenticated
  USING (reported_by = auth.uid())
  WITH CHECK (reported_by = auth.uid());

-- ── Fix lecturer_courses student policy (prevent 42P17 recursion) ────────────
-- The legacy student policy on lecturer_courses often created cycles with
-- the enrollments policies. Use a SECURITY DEFINER helper (add if missing).

CREATE OR REPLACE FUNCTION public.auth_student_enrolled_course_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Primary: enrolled courses
  SELECT course_id FROM enrollments
  WHERE student_id = auth.uid()
    AND is_active = true
  UNION
  -- Fallback (no enrollments at all): courses matching the student's level + university
  SELECT c.id FROM courses c
  JOIN profiles p ON p.id = auth.uid()
  WHERE p.level IS NOT NULL
    AND c.level = p.level
    AND c.university_id = p.university_id
    AND NOT EXISTS (
      SELECT 1 FROM enrollments e WHERE e.student_id = auth.uid() AND e.is_active = true
    );
$$;

REVOKE ALL ON FUNCTION public.auth_student_enrolled_course_ids() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_student_enrolled_course_ids() FROM anon;
GRANT EXECUTE ON FUNCTION public.auth_student_enrolled_course_ids() TO authenticated;

CREATE OR REPLACE FUNCTION public.auth_lecturer_course_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT course_id FROM lecturer_courses
  WHERE lecturer_id = auth.uid()
    AND is_active = true;
$$;

REVOKE ALL ON FUNCTION public.auth_lecturer_course_ids() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_lecturer_course_ids() FROM anon;
GRANT EXECUTE ON FUNCTION public.auth_lecturer_course_ids() TO authenticated;

DROP POLICY IF EXISTS "Students read lecturer_courses for enrolled courses" ON lecturer_courses;

CREATE POLICY "Students read lecturer_courses for enrolled courses"
  ON lecturer_courses FOR SELECT TO authenticated
  USING (course_id IN (SELECT auth_student_enrolled_course_ids()));
