# 2. Features

## 1. Public Portal & Onboarding
* **Marketing Landing Page:** Introduces Uniflow, details feature offerings, and houses a link to the registration flow.
* **Public Registration (`/register`):** University representatives submit registration details (name, short name, contact info, email, website). Creates a pending record in `university_registrations`.
* **Subdomain Redirection:** The web server resolves subdomains (e.g., `abu-admin.uniflowapp.xyz` -> university-specific portal) and enforces route guards.

---

## 2. Uniflow Admin Dashboard (Super Admin)
* **Access Control:** Restricted strictly to profiles with `uniflow_admin` role.
* **Registrations Review:** Super Admins view a queue of pending registrations and can either approve or reject them.
* **University Approval System (`POST /api/approve-university`):** 
  * Normalizes the university's official email address.
  * Dynamically creates a Supabase Auth user.
  * Inserts database records in `universities`, `profiles`, and `university_admins` (linking the user to the university).
  * Generates an Auth Recovery link redirecting to `/reset-password?university={shortname}`.
  * Dispatches an onboarding email via Resend with subdomain link and password setup trigger.
* **Rejection Path (`POST /api/reject-university`):** Marks registration status as rejected, logs the reason, and sends an email inviting the representative to reapply.
* **Universities Directory:** Lists all approved institutions, status (active/inactive), and offers a trigger to resend password reset emails to university administrators.

---

## 3. University Admin Portal (`{shortname}-admin.uniflowapp.xyz`)
* **Subdomain Auth Proxying:** Next.js middleware rewrites request URLs and checks if the logged-in administrator belongs to the specific university subdomain. Redirects unauthorized users to `/unauthorized`.
* **Faculties & Departments CRUD:** Manage the university's academic structure.
  * **Dean Designation:** Assign a lecturer profile as the Dean of a Faculty (stored in `faculties.dean_id`).
  * **HOD Designation:** Assign a lecturer profile as the Head of Department (stored in `departments.hod_id`).
* **Staff Management:**
  * View, create, update, and toggle active status for staff (`lecturer`, `dean`, `hod`).
  * **CSV Staff Import:** Bulk upload lecturers using standard CSV formats.
  * **Admin Reset Password:** Re-send activation/reset emails to lecturers.
* **Student Registry:**
  * Manage students, filterable by Faculty, Department, and Academic Level (100 to 500).
  * **CSV Student Import:** Bulk upload students (`full_name, email, level, department_short_name`).
  * Admin trigger for resetting student passwords.
* **Course Catalog:** Create, list, edit, or delete catalog courses. Scoped by department, level, and semester.
* **Timetable & Course Offerings Hub:**
  * **Manual Scheduler:** Add individual timetable slots linking a course, lecturer, day, time, and venue.
  * **Combined CSV Timetable Import (`POST /api/timetable/import`):** Upload a single CSV mapping courses, levels, semesters, credits, lecturers, days, times, and venues. Automatically generates/upserts courses, assignments, and timetable slots.
  * **Auto-Enrollment (`POST /api/enrollments/auto`):** Automatically enroll students into course offerings for the current semester if their department and level match the course parameters.

---

## 4. Mobile Application (Students & Lecturers)
* **Auth Guard & Session Hydration:** Zustands-managed authentication. Hydrates sessions on startup, matches profile roles, checks if the account is active, and blocks web admins from signing into the mobile app.
* **Mobile Self-Service Forgot Password:** Triggers a password reset email using a dedicated public API handler (`/api/public/request-password-reset`) scoped to mobile roles only.
* **Dynamic Dashboards:**
  * **Today's Classes:** Real-time view of timetable slots scheduled for the current day. Moving away from top-level module caching to live render-time calculations.
  * **Upcoming Schedule:** View succeeding slots for the week.
  * **Lecturer Stats:** Displays student enrollment counts per assigned course.
  * **Student Stats:** Quick access to enrolled courses and timetable events.
* **Timetable Tab:** Interactive calendar showing the weekly class schedule, color-coded slots, location coordinates/venue labels, and start/end times.
* **Courses Tab:**
  * **Students:** Displays enrolled course cards with code, title, credits, and lecturer name.
  * **Lecturers:** Displays assigned course offerings.
* **Class Updates & Status Reports:**
  * **Lecturer Announcement:** Post class delays (specifying `delay_minutes` and custom titles), relocations, or cancellations.
  * **Student Crowdsourced Reporting:** Students can report a class status (e.g. "Lecturer not in class").
  * **Community Upvoting (`upvote_class_update` RPC):** Enrolled students upvote active reports to verify authenticity, preventing spam reports.
* **Resources Tab:**
  * **Lecturer Upload:** Upload PDFs, images, or document files directly to the course offering repository. Uses a robust FormData system with raw FileSystem array buffers fallback to support React Native's complex URI handling.
  * **Student Access:** Browse and download approved course materials.
* **Profile Settings:**
  * View academic/staff profiles with role-specific labels (e.g., HOD, Dean).
  * In-session password updates (requires entering current password, updating via Supabase Auth client).
  * **Profile Avatar Upload:** Choose and crop images to save to the `avatars` bucket.
* **Real-time Notifications:** Integrates Expo Push Notifications, registering device push tokens and displaying in-app alerts.
