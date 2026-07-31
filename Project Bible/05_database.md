# 5. Database Design

Uniflow uses a Supabase-managed PostgreSQL 15 database. Security is enforced strictly via Postgres Row Level Security (RLS). Below is the comprehensive schema definition, relationships, indexes, policies, and procedural functions.

---

## 1. Table Definitions

### `university_registrations`
*Tracks prospective onboarding applications from the public registration form.*
* `id` uuid PRIMARY KEY DEFAULT gen_random_uuid()
* `university_name` text NOT NULL
* `short_name` text NOT NULL UNIQUE (e.g. `abu`, `unilag`, used as subdomain prefix)
* `official_email` text NOT NULL
* `phone` text NOT NULL
* `country` text NOT NULL
* `state` text NOT NULL
* `contact_person_name` text NOT NULL
* `contact_person_role` text NOT NULL
* `student_count` integer NOT NULL
* `website` text
* `status` text NOT NULL DEFAULT 'pending' (check constraint: `'pending'`, `'approved'`, `'rejected'`)
* `reviewed_at` timestamptz
* `created_at` timestamptz DEFAULT now()

### `universities`
*Approved universities active on the platform.*
* `id` uuid PRIMARY KEY DEFAULT gen_random_uuid()
* `name` text NOT NULL
* `short_name` text NOT NULL UNIQUE
* `country` text NOT NULL
* `state` text NOT NULL
* `is_active` boolean NOT NULL DEFAULT true
* `status` text NOT NULL DEFAULT 'approved'
* `created_at` timestamptz DEFAULT now()

### `university_admins`
*Security table linking auth.users directly to their universities, preventing admin privilege bleeding.*
* `id` uuid PRIMARY KEY DEFAULT gen_random_uuid()
* `user_id` uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE
* `university_id` uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE
* `created_at` timestamptz DEFAULT now()
* UNIQUE (user_id, university_id)

### `profiles`
*Core platform directory containing personal information, role details, and organizational anchors.*
* `id` uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
* `university_id` uuid REFERENCES universities(id) ON DELETE CASCADE (nullable for Super Admins)
* `full_name` text NOT NULL
* `email` text NOT NULL
* `role` text NOT NULL (check constraint: `'uniflow_admin'`, `'university_admin'`, `'lecturer'`, `'dean'`, `'hod'`, `'student'`)
* `department_id` uuid REFERENCES departments(id) ON DELETE SET NULL
* `level` integer (nullable, constraint: check `IN (100, 200, 300, 400, 500)`)
* `is_active` boolean NOT NULL DEFAULT true
* `avatar_url` text
* `created_at` timestamptz DEFAULT now()

### `faculties`
*Top-tier organizational structure.*
* `id` uuid PRIMARY KEY DEFAULT gen_random_uuid()
* `university_id` uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE
* `name` text NOT NULL
* `dean_id` uuid REFERENCES profiles(id) ON DELETE SET NULL (dean must be a lecturer)
* `created_at` timestamptz DEFAULT now()

### `departments`
*Mid-tier organizational divisions within faculties.*
* `id` uuid PRIMARY KEY DEFAULT gen_random_uuid()
* `faculty_id` uuid NOT NULL REFERENCES faculties(id) ON DELETE CASCADE
* `university_id` uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE
* `name` text NOT NULL
* `short_name` text NOT NULL
* `hod_id` uuid REFERENCES profiles(id) ON DELETE SET NULL (HOD must be a lecturer)
* `created_at` timestamptz DEFAULT now()

### `courses`
*Academic course catalog listing.*
* `id` uuid PRIMARY KEY DEFAULT gen_random_uuid()
* `university_id` uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE
* `department_id` uuid NOT NULL REFERENCES departments(id) ON DELETE CASCADE
* `code` text NOT NULL (e.g. `CSC301`)
* `title` text NOT NULL
* `level` integer NOT NULL (check `IN (100, 200, 300, 400, 500)`)
* `semester` integer NOT NULL (check `IN (1, 2)`)
* `credit_units` integer NOT NULL
* `created_at` timestamptz DEFAULT now()

### `course_offerings`
*Runtime course instances matching academic session, semester, and instructor.*
* `id` uuid PRIMARY KEY DEFAULT gen_random_uuid()
* `course_id` uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE
* `lecturer_id` uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
* `department_id` uuid NOT NULL REFERENCES departments(id) ON DELETE CASCADE
* `university_id` uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE
* `academic_session` text NOT NULL (e.g. `"2025/2026"`)
* `semester` smallint NOT NULL CHECK (semester IN (1, 2))
* `is_active` boolean NOT NULL DEFAULT true
* `created_at` timestamptz DEFAULT now()
* UNIQUE (course_id, lecturer_id, academic_session, semester)

### `timetable`
*Day and slot assignments linked to course offerings.*
* `id` uuid PRIMARY KEY DEFAULT gen_random_uuid()
* `university_id` uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE
* `department_id` uuid NOT NULL REFERENCES departments(id) ON DELETE CASCADE
* `course_offering_id` uuid REFERENCES course_offerings(id) ON DELETE CASCADE
* `day_of_week` text NOT NULL (check `IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')`)
* `start_time` time NOT NULL
* `end_time` time NOT NULL
* `venue` text NOT NULL
* `is_active` boolean NOT NULL DEFAULT true
* `created_at` timestamptz DEFAULT now()
* **Legacy Fallback Fields:**
  * `course_id` uuid REFERENCES courses(id) ON DELETE SET NULL
  * `lecturer_id` uuid REFERENCES profiles(id) ON DELETE SET NULL
  * `academic_session` text
  * `semester` integer

### `enrollments`
*Connects students to their course offerings.*
* `id` uuid PRIMARY KEY DEFAULT gen_random_uuid()
* `student_id` uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
* `course_offering_id` uuid REFERENCES course_offerings(id) ON DELETE CASCADE
* `university_id` uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE
* `academic_session` text NOT NULL
* `semester` integer NOT NULL
* `is_active` boolean NOT NULL DEFAULT true
* `created_at` timestamptz DEFAULT now()
* UNIQUE (student_id, course_offering_id) WHERE course_offering_id IS NOT NULL AND is_active = true
* **Legacy Fallback Fields:**
  * `course_id` uuid REFERENCES courses(id) ON DELETE SET NULL

### `class_updates`
*Real-time announcements about class delay, location updates, or cancellation.*
* `id` uuid PRIMARY KEY DEFAULT gen_random_uuid()
* `university_id` uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE
* `timetable_id` uuid NOT NULL REFERENCES timetable(id) ON DELETE CASCADE
* `update_date` date NOT NULL
* `status` text NOT NULL CHECK (status IN ('delayed', 'cancelled', 'relocated', 'on-time'))
* `delay_minutes` integer DEFAULT 0
* `new_venue` text
* `title` text NOT NULL
* `reported_by` uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
* `upvotes` integer NOT NULL DEFAULT 0
* `created_at` timestamptz DEFAULT now()

### `resources`
*Learning assets uploaded by lecturers for course offerings.*
* `id` uuid PRIMARY KEY DEFAULT gen_random_uuid()
* `university_id` uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE
* `course_offering_id` uuid REFERENCES course_offerings(id) ON DELETE CASCADE
* `title` text NOT NULL
* `file_url` text NOT NULL
* `file_type` text NOT NULL
* `file_size` integer NOT NULL
* `uploaded_by` uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
* `is_approved` boolean NOT NULL DEFAULT true
* `created_at` timestamptz DEFAULT now()
* `academic_session` text NOT NULL
* **Legacy Fallback Fields:**
  * `course_id` uuid REFERENCES courses(id) ON DELETE SET NULL

### `notifications`
*User-specific notifications.*
* `id` uuid PRIMARY KEY DEFAULT gen_random_uuid()
* `user_id` uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
* `university_id` uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE
* `title` text NOT NULL
* `message` text NOT NULL
* `is_read` boolean NOT NULL DEFAULT false
* `created_at` timestamptz DEFAULT now()

---

## 2. Row Level Security (RLS) Policies

### `university_registrations`
* PUBLIC can INSERT (onboards from `/register`).
* `uniflow_admin` has full control (ALL).
* Other roles have no SELECT access.

### `universities`
* `uniflow_admin` has full control (ALL).
* All authenticated users can SELECT (`is_active = true`).

### `university_admins`
* Users can SELECT their own records: `user_id = auth.uid()`.
* `uniflow_admin` can manage all (ALL).

### `profiles`
* Users can SELECT other profiles within their same `university_id`.
* Users can UPDATE their own `id = auth.uid()` profiles (avatars/emails).
* `university_admin` can INSERT/UPDATE profiles where `university_id = profile.university_id`.

### `faculties` / `departments` / `courses`
* `university_admin` can manage (ALL) if matching subdomain `university_id`.
* Authenticated users can SELECT if matching `university_id`.

### `course_offerings`
* `university_admin` can manage (ALL).
* Lecturers can SELECT if `lecturer_id = auth.uid()`.
* Students can SELECT if `check_student_enrolled(id)`.

### `timetable`
* `university_admin` can manage (ALL).
* Lecturers can SELECT if `lecturer_id = auth.uid()` OR `check_lecturer_offering(course_offering_id, course_id)`.
* Students can SELECT if `check_student_enrolled_by_course(course_id, course_offering_id)`.

### `enrollments`
* `university_admin` can manage (ALL).
* Lecturers can SELECT if assigned `check_lecturer_offering(course_offering_id, course_id)`.
* Students can SELECT if `student_id = auth.uid()`.

### `class_updates`
* `university_admin` can manage (ALL).
* Lecturers can SELECT and INSERT class updates for slots they teach.
* Students can SELECT and INSERT reports if enrolled: `check_student_enrolled_by_course(timetable.course_id, timetable.course_offering_id)`.
* Own reporter can UPDATE: `reported_by = auth.uid()`.

### `resources`
* `university_admin` can manage (ALL).
* Lecturers can INSERT and UPDATE if teaching course offering: `course_id IN (SELECT auth_lecturer_course_ids())`.
* Students/Lecturers can SELECT if approved and matching `university_id`.

---

## 3. Database Functions & RPCs

### `check_student_enrolled(target_course_offering_id uuid)`
*Returns true if authenticated student is enrolled in offering, or has level matching offering's course (fallback).*
```sql
  SELECT EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e.course_offering_id = target_course_offering_id
      AND e.student_id = auth.uid()
      AND e.is_active = true
  );
```

### `check_lecturer_offering(target_course_offering_id uuid, target_course_id uuid)`
*Returns true if authenticated lecturer is teaching the offering.*
```sql
  SELECT EXISTS (
    SELECT 1 FROM course_offerings co
    WHERE co.lecturer_id = auth.uid()
      AND co.is_active = true
      AND (
        (target_course_offering_id IS NOT NULL AND target_course_offering_id = co.id)
        OR (target_course_offering_id IS NULL AND target_course_id = co.course_id)
      )
  );
```

### `upvote_class_update(p_update_id uuid)`
*Security-definered RPC allowing students enrolled in a slot to verify/upvote a peer delay report.*
* Checks if `p_update_id` exists in `class_updates`.
* Checks enrollment: user must be enrolled in target slot via `check_student_enrolled_by_course()`.
* Increments `upvotes` count by 1.
