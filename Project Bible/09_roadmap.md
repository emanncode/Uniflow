# 9. Roadmap

The development of Uniflow is structured across distinct architectural phases, transitioning from standalone entities to a unified relational model centered on Course Offerings.

---

## 1. Version 1 — Core Infrastructure (Completed)
* **University Onboarding Pipeline:** Public sign-up form, Super Admin validation reviews, automated database bootstrapping, and Resend invitations.
* **Organizational Structure Management:** University Admin interfaces for CRUD operations on Faculties, Departments, Courses, Staff, and Students.
* **Basic Timetable Scheduler:** Simple slot scheduling linking courses directly to days, times, and classrooms.
* **Basic Mobile App:** Student and Lecturer weekly timetables, notification hooks, and profile avatar adjustments.

---

## 2. Version 2 — Course Offerings Hub (In Progress)
* **Offering Relational Hub:** Linking catalog courses to active academic session, semester, and designated lecturer (`course_offerings`).
* **Combined CSV Timetable Import:** Single CSV upload automatically configuring courses, sessions, lecturer assignments, and multiple weekly slots.
* **Automatic Enrollments Engine:** Bulk mapping students matching department, level, and semester boundaries directly to active offerings.
* **Dynamic Class Updates:** Lecturer delays (with specific minute-delay parameters) and student crowdsourced reporting with verification upvoting.
* **Secure Document Uploads:** Lecturer file storage upload pipeline pushing to a private bucket with student access rights.
* **Mobile Hook Hardening:** Caching and query resilience layers supporting session fallbacks.

---

## 3. Version 3 — Admin Portal Simplification & Exceptions (Near Term)
* **Supabase Migration Execution:** Deploying SQL migrations (`class_updates`, `course_offerings`) to production environments.
* **Courses Catalog Cleanup:** Refactoring the web portal `u/courses` page to catalog cataloging only, removing legacy lecturer assignments.
* **Dedicated Offerings UI (`u/offerings`):** An administrative dashboard to track active offerings, manually create single instances, and review lecturer loads.
* **Manual Enrollment Overrides (`POST /api/enrollments`):** UI and endpoints enabling university administrators to manually add exceptions (e.g. carry-over students) to specific course offerings.
* **Mobile Timetable Speedups:** Indexing queries to speed up loading times on older Android/iOS models.

---

## 4. Future Expansion Ideas
* **Google/Apple Calendar Synchronizer:** Allows students and lecturers to export their Uniflow timetables directly into external calendars.
* **Academic Analytics Engine:** Portal dashboards providing university deans with analytics on lecture delays, resource uploads, and student course load trends.
* **Real-time Course Bulletin Channels:** Dedicated read-only announcements channel per course offering, allowing lecturers to broadcast urgent class alerts directly.
