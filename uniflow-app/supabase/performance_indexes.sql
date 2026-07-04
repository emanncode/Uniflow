-- Performance indexes for uniflow.
-- Run in Supabase SQL Editor.
-- These indexes target columns used in RLS policies, frequent WHERE filters, and JOINs.
--
-- After running, it is recommended to also run:
--   ANALYZE public.profiles;
--   ANALYZE public.enrollments;
--   ANALYZE public.course_offerings;
--   ANALYZE public.timetable;
--   ANALYZE public.resources;
--   ANALYZE public.class_updates;
--   ANALYZE public.notifications;
-- ── profiles (used in EVERY RLS policy + staff listings) ────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

CREATE INDEX IF NOT EXISTS idx_profiles_university_id ON public.profiles (university_id);

CREATE INDEX IF NOT EXISTS idx_profiles_role_university ON public.profiles (role, university_id);

-- Useful for admin staff lists and role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_university_role_active ON public.profiles (university_id, role, is_active);

-- ── courses ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_courses_university_id ON public.courses (university_id);

CREATE INDEX IF NOT EXISTS idx_courses_department_id ON public.courses (department_id);

-- ── departments ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_departments_university_id ON public.departments (university_id);

-- ── faculties ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_faculties_university_id ON public.faculties (university_id);

-- ── timetable ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_timetable_university_id ON public.timetable (university_id);

CREATE INDEX IF NOT EXISTS idx_timetable_uni_dept_active ON public.timetable (university_id, department_id, is_active);

CREATE INDEX IF NOT EXISTS idx_timetable_course_id ON public.timetable (course_id);

-- Composite for the most common filtered query pattern (lecturer + student)
CREATE INDEX IF NOT EXISTS idx_timetable_session_semester_lecturer ON public.timetable (
  academic_session,
  semester,
  lecturer_id,
  is_active
);

CREATE INDEX IF NOT EXISTS idx_timetable_session_semester_course ON public.timetable (academic_session, semester, course_id, is_active);

-- ── course_offerings ────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_course_offerings_course_id ON public.course_offerings (course_id);

CREATE INDEX IF NOT EXISTS idx_course_offerings_university_id ON public.course_offerings (university_id);

-- Critical for web admin + API queries (university + session + active)
CREATE INDEX IF NOT EXISTS idx_course_offerings_uni_session_active ON public.course_offerings (
  university_id,
  academic_session,
  semester,
  is_active
);

-- ── enrollments ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments (student_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments (course_id);

-- Common filtered queries for enrollments (used heavily by student hooks)
CREATE INDEX IF NOT EXISTS idx_enrollments_session_semester_student ON public.enrollments (academic_session, semester, student_id, is_active);

-- ── class_updates ───────────────────────────────────────────────────────────
-- Make sure class_updates_migration.sql has been run first (otherwise these will fail with 42703 if timetable_id missing).
CREATE INDEX IF NOT EXISTS idx_class_updates_university_id ON public.class_updates (university_id);

CREATE INDEX IF NOT EXISTS idx_class_updates_timetable_id ON public.class_updates (timetable_id);

CREATE INDEX IF NOT EXISTS idx_class_updates_date_university ON public.class_updates (update_date, university_id);

-- Very common pattern: fetch updates for a list of timetable slots on a specific day
CREATE INDEX IF NOT EXISTS idx_class_updates_uni_date_timetable ON public.class_updates (university_id, update_date, timetable_id);

-- ── resources ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_resources_course_id ON public.resources (course_id);

CREATE INDEX IF NOT EXISTS idx_resources_university_id ON public.resources (university_id);

CREATE INDEX IF NOT EXISTS idx_resources_uploaded_by ON public.resources (uploaded_by);

-- Student resources query: filtered by course + approved status
CREATE INDEX IF NOT EXISTS idx_resources_course_approved ON public.resources (course_id, is_approved)
WHERE
  is_approved = true;

-- Helpful for recent activity lists and ordering in dashboards
CREATE INDEX IF NOT EXISTS idx_resources_uni_created ON public.resources (university_id, created_at DESC);

-- ── notifications ───────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_university_id ON public.notifications (university_id);

-- Extremely hot path: unread count query (used by useUnreadNotificationCount + realtime)
CREATE INDEX IF NOT EXISTS idx_notifications_user_is_read ON public.notifications (user_id, is_read);

-- For listing notifications (most recent first)
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications (user_id, created_at DESC);

-- ── university_registrations ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_university_registrations_status ON public.university_registrations (status);

-- ── lecturer_courses (legacy) ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_lecturer_courses_lecturer_id ON public.lecturer_courses (lecturer_id);

CREATE INDEX IF NOT EXISTS idx_lecturer_courses_course_id ON public.lecturer_courses (course_id);

-- Legacy fallback path still used in some hooks
CREATE INDEX IF NOT EXISTS idx_lecturer_courses_session_semester ON public.lecturer_courses (
  lecturer_id,
  academic_session,
  semester,
  is_active
);