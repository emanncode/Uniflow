-- Performance indexes for uniflow.
-- Run in Supabase SQL Editor.
-- These indexes target columns used in RLS policies, frequent WHERE filters, and JOINs.

-- ── profiles (used in EVERY RLS policy) ─────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON public.profiles (role);

CREATE INDEX IF NOT EXISTS idx_profiles_university_id
  ON public.profiles (university_id);

CREATE INDEX IF NOT EXISTS idx_profiles_role_university
  ON public.profiles (role, university_id);

-- ── courses ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_courses_university_id
  ON public.courses (university_id);

CREATE INDEX IF NOT EXISTS idx_courses_department_id
  ON public.courses (department_id);

-- ── departments ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_departments_university_id
  ON public.departments (university_id);

-- ── faculties ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_faculties_university_id
  ON public.faculties (university_id);

-- ── timetable ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_timetable_university_id
  ON public.timetable (university_id);

CREATE INDEX IF NOT EXISTS idx_timetable_uni_dept_active
  ON public.timetable (university_id, department_id, is_active);

CREATE INDEX IF NOT EXISTS idx_timetable_course_id
  ON public.timetable (course_id);

-- ── course_offerings ────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_course_offerings_course_id
  ON public.course_offerings (course_id);

CREATE INDEX IF NOT EXISTS idx_course_offerings_university_id
  ON public.course_offerings (university_id);

-- ── enrollments ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_enrollments_student_id
  ON public.enrollments (student_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_course_id
  ON public.enrollments (course_id);

-- ── class_updates ───────────────────────────────────────────────────────────
-- Make sure class_updates_migration.sql has been run first (otherwise these will fail with 42703 if timetable_id missing).

CREATE INDEX IF NOT EXISTS idx_class_updates_university_id
  ON public.class_updates (university_id);

CREATE INDEX IF NOT EXISTS idx_class_updates_timetable_id
  ON public.class_updates (timetable_id);

-- ── resources ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_resources_course_id
  ON public.resources (course_id);

CREATE INDEX IF NOT EXISTS idx_resources_university_id
  ON public.resources (university_id);

CREATE INDEX IF NOT EXISTS idx_resources_uploaded_by
  ON public.resources (uploaded_by);

-- ── notifications ───────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_notifications_user_id
  ON public.notifications (user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_university_id
  ON public.notifications (university_id);

-- ── university_registrations ────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_university_registrations_status
  ON public.university_registrations (status);

-- ── lecturer_courses ────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_lecturer_courses_lecturer_id
  ON public.lecturer_courses (lecturer_id);

CREATE INDEX IF NOT EXISTS idx_lecturer_courses_course_id
  ON public.lecturer_courses (course_id);
