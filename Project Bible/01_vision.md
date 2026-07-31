# 1. Vision

## Why This Product Exists
Uniflow exists to solve the critical coordination gap between university administrations, academic staff, and students. In many higher education institutions, timetables are static paper sheets or PDFs, resources are shared via fragmented channels (WhatsApp, email, physical copies), and there is zero real-time visibility into whether a lecturer is running late, a class has been relocated, or a session is cancelled. 

Uniflow bridges this gap with a dual-interface system:
1. A robust **administrative web portal** for management and setup.
2. A fast, modern **mobile application** for students and lecturers to coordinate daily life.

---

## Target Users

### 1. Uniflow Super Administrator (`uniflow_admin`)
* **Role:** Platform operator.
* **Needs:** Onboard universities, review registrations, manage system settings, and act as the top-level technical contact.

### 2. University Administrator (`university_admin`)
* **Role:** Institutional coordinator.
* **Needs:** Configure faculties, departments, courses, and timetables; manage student and lecturer registries; reset credentials.

### 3. Academic Staff (Lecturers, Deans, HODs)
* **Role:** Educators and department leads.
* **Needs:** View their assigned courses and schedule, upload learning resources, and announce real-time class updates (delays, cancellations, or room changes). Deans and HODs additionally manage faculty-wide or department-wide operations.

### 4. Students
* **Role:** Learners.
* **Needs:** View their customized course schedule and class timetable based on their level and department, download learning resources, and view or report class status updates.

---

## Problems Being Solved

* **Static, Outdated Timetables:** Physical or PDF-based timetables cannot adapt to room changes, double-bookings, or last-minute slot changes.
* **No Real-Time Visibility:** Students often walk across campus only to find that a lecturer is absent or a class was rescheduled. Uniflow introduces peer-verified and lecturer-verified class updates.
* **Fragmented Learning Materials:** Resource sharing is scattered. Uniflow provides a dedicated repository linked directly to course offerings.
* **Clunky Admin Workflows:** Setting up course catalogs, lecturer assignments, and schedules historically required multiple steps. Uniflow combines this into a single CSV import.
* **Lack of Session Scope:** Academic structures change. Uniflow scopes all active timetables and enrollments to a specific academic session and semester.

---

## Goals

* **Single Source of Truth:** Unify timetable scheduling, course offerings, and enrollments in one relational PostgreSQL database.
* **Design-First Development:** Maintain consistent UI/UX across mobile (using dark theme presets) and web portals by designing and getting approval for frames first.
* **Academic Scoping:** Ensure that data queries automatically respect the active academic session (e.g., `2025/2026`) and semester (e.g., `1` or `2`).
* **Real-time Push Alerts:** Deliver notifications to mobile devices the moment class schedules are updated or resources uploaded.
* **Robust Offline Fallbacks:** Allow students and lecturers to view cached timetables and course lists even in areas of poor connectivity.

---

## Non-Goals

* **Learning Management System (LMS):** Uniflow does not handle online tests, quizzes, assignments submissions, grading, or online lecture delivery.
* **Fee Collection & Payments:** Tuition fees, accommodation bookings, and financial administration are left to existing institutional ERPs.
* **General Social Network:** The mobile app does not provide general student messaging or forums; communications are strictly limited to class updates and course resources.
