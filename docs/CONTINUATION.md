# Uniflow — AI Handoff / Continuation Guide

Use this document to continue development with another AI or developer. Read **`docs/uniflow-workflow.md`** for the full platform journey (Uniflow Admin → University Admin → Mobile App).

---

## 1. Repository layout

```
uniflow/
├── uniflow-web/          # Next.js 16 — admin portals + marketing
├── uniflow-app/          # Expo React Native — student/lecturer mobile
├── docs/
│   ├── uniflow-workflow.md      # End-to-end platform workflow
│   ├── CONTINUATION.md          # This file
│   └── course-offering-design.md # Courses ↔ timetable redesign
└── memory/architecture.md       # May be stale; prefer docs/ above
```

**Backend:** Supabase (Auth + Postgres + RLS + Storage). No separate API server — Next.js route handlers use `createAdminClient()` for privileged ops.

**Domains (production):**

| Host                           | Role                                                   |
| ------------------------------ | ------------------------------------------------------ |
| `uniflowapp.xyz`               | Marketing, Uniflow Admin login, reset-password landing |
| `admin.uniflowapp.xyz`         | Uniflow Admin dashboard                                |
| `{short}-admin.uniflowapp.xyz` | University Admin portal                                |

---

## 2. Roles (critical)

| Role                      | Web                | Mobile                         |
| ------------------------- | ------------------ | ------------------------------ |
| `uniflow_admin`           | ✅ super dashboard | ❌ blocked                     |
| `university_admin`        | ✅ uni portal      | ❌ blocked                     |
| `student`                 | ❌                 | ✅ `(student)` tabs            |
| `lecturer`, `dean`, `hod` | ❌                 | ✅ `(lecturer)` tabs (same UI) |

Role gates: `uniflow-web/src/lib/role-access.ts`, `uniflow-app/lib/role-access.ts`

**Password policy:** No self-service forgot-password on web admin portals. Mobile has forgot-password. Admin-initiated reset emails only for web admins.

---

## 3. Course Offering redesign (IN PROGRESS)

### Problem that was solved

Old model had **three disconnected tables** (`lecturer_courses`, `timetable`, `enrollments`) with no enrollment UI, no session filtering, and lecturers using two different query paths on mobile.

### New model

**`course_offerings`** is the hub:

```
courses (catalog)
  → course_offerings (course + lecturer + department + session + semester)
      → timetable (slots: day, time, venue)
      → enrollments (students, auto by level)
```

### Admin workflow (target)

1. Import **students** CSV (existing): `full_name, email, level, department_short_name`
2. Import **one combined CSV** on Timetable page:
   ```
   course_code,course_title,level,semester,credit_units,lecturer_email,day,start_time,end_time,venue
   ```

   - Rows with schedule → offering + slot
   - Rows without day/time → offering only (schedule later)
   - Same `course_code` + `lecturer_email` repeated = multiple slots (lecture + lab)
3. System **auto-enrolls** students matching `department + level + semester`
4. Mobile app shows courses/timetable immediately

### What was implemented (check git diff)

| Area               | Status                               | Key files                                                                                          |
| ------------------ | ------------------------------------ | -------------------------------------------------------------------------------------------------- |
| SQL migration      | ✅ Written, **must run in Supabase** | `uniflow-app/supabase/class_updates_migration.sql`, `course_offerings_migration.sql`, `*_rls*.sql` |
| Combined CSV API   | ✅                                   | `uniflow-web/src/app/api/timetable/import/route.ts`                                                |
| Auto-enroll API    | ✅                                   | `uniflow-web/src/app/api/enrollments/auto/route.ts`                                                |
| Offerings list API | ✅ GET only                          | `uniflow-web/src/app/api/course-offerings/route.ts`                                                |
| Combined import UI | ✅ On timetable page                 | `uniflow-web/src/components/university/CombinedTimetableImport.tsx`                                |
| Session helpers    | ✅                                   | `getAcademicContext()` in web + mobile `lib/academic.ts`                                           |
| Mobile hooks       | ✅ Offering-aware + legacy fallback  | `useStudentEnrollments.ts`, `useLecturerCourseIds.ts`                                              |
| Mobile screens     | ✅ Updated                           | student/lecturer courses, timetable, index, resources                                              |
| Types              | ✅                                   | `uniflow-app/types/index.ts` — `CourseOffering`, `course_offering_id` fields                       |

### What is NOT done yet (next AI should do)

1. **Run SQL migrations** in Supabase SQL Editor (order matters):
   - `class_updates_migration.sql` (if you see "column class_updates.timetable_id does not exist" or "Could not find the 'delay_minutes' column of 'class_updates' in the schema cache")
   - `course_offerings_migration.sql`
   - `course_offerings_rls.sql` (or `course_offerings_rls_clean.sql`)

2. **Refactor `u/courses` page** — catalog only; remove lecturer assignment UI (now handled by combined CSV / offerings).

3. **Dedicated `u/offerings` page** (optional) — list offerings, manual add, per-offering enrollment override UI.

4. **Manual enroll/unenroll API + UI** — `POST /api/enrollments` for exceptions (plan item; not implemented).

5. **Remove legacy paths** (phase 2):
   - Drop `lecturer_courses` usage from web courses page
   - Remove `lecturer_courses` table after verification
   - Drop `timetable.course_id` / `timetable.lecturer_id` nullable legacy columns

6. **Update `docs/uniflow-workflow.md`** — courses/timetable section still describes old model.

7. **Lecturer index** (`uniflow-app/app/(lecturer)/index.tsx`) — verify it uses offering-based timetable if it queries timetable directly.

8. **Tests** — none exist; add smoke tests for CSV import + auto-enroll.

---

## 4. Mandatory setup steps for any environment

### Web (`uniflow-web`)

```bash
cd uniflow-web
cp .env.local.example .env.local   # if exists
npm install
npm run dev                        # localhost:3000
```

Env vars (typical):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server routes)
- `NEXT_PUBLIC_BASE_DOMAIN` (default `uniflowapp.xyz`)
- `RESEND_API_KEY` (emails)

### Mobile (`uniflow-app`)

```bash
cd uniflow-app
npm install
npx expo start
```

Env (`eas.json` / `.env`):

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_WEB_APP_URL` (for forgot-password API)

### Supabase migrations (run manually)

Execute SQL files in `uniflow-app/supabase/` in Supabase Dashboard → SQL Editor. Order:

1. `courses_rls.sql`
2. `department_levels.sql`
3. `timetable_department_fk.sql`
4. `profiles_rls_fix.sql`
5. **`class_updates_migration.sql`** ← ensures timetable_id + other columns (including delay_minutes) exist (fixes 42703 / PGRST204 schema cache errors)
6. `mobile_read_rls.sql`  (re-run to fix recursion in lecturer_courses policies)
7. **`course_offerings_migration.sql`** ← new
8. **`course_offerings_rls.sql`** / `course_offerings_rls_clean.sql`  (re-run; includes safe lecturer_courses policies)

**Redirect URLs** (Authentication → URL Configuration):

- `https://uniflowapp.xyz/reset-password**`
- `https://*-admin.uniflowapp.xyz/**`

---

## 5. Key code paths

### Routing / auth (web)

- `uniflow-web/src/proxy.ts` — subdomain routing, auth guards
- `uniflow-web/src/lib/subdomain.ts` — host parsing
- `uniflow-web/src/app/api/auth/verify-portal/route.ts` — login role check

### University portal pages

| Path (external on subdomain) | File                              |
| ---------------------------- | --------------------------------- |
| `/`                          | `src/app/(university)/u/page.tsx` |
| `/faculties`                 | `u/faculties/page.tsx`            |
| `/departments`               | `u/departments/page.tsx`          |
| `/courses`                   | `u/courses/page.tsx`              |
| `/timetable`                 | `u/timetable/page.tsx`            |
| `/students`                  | `u/students/page.tsx`             |
| `/lecturers`                 | `u/lecturers/page.tsx`            |

### APIs (university admin)

| Endpoint                       | Purpose                               |
| ------------------------------ | ------------------------------------- |
| `POST /api/create-staff`       | Create student/lecturer + reset email |
| `POST /api/reset-password`     | Admin-initiated password reset        |
| `POST /api/approve-university` | Onboard new university                |
| `POST /api/timetable/import`   | **Combined CSV** preview/commit       |
| `POST /api/enrollments/auto`   | Auto-enroll by dept/level             |
| `GET /api/course-offerings`    | List offerings                        |

### Mobile auth

- `uniflow-app/store/useAuthStore.ts` — sign-in, hydrate, role block
- `uniflow-app/app/_layout.tsx` — AuthGuard routes to `(student)` or `(lecturer)`

### Mobile data fetching (offerings era)

- `hooks/useStudentEnrollments.ts` → `{ courseIds, offeringIds }`
- `hooks/useLecturerCourseIds.ts` → `{ courseIds, offeringIds }` (queries `course_offerings`, falls back to `lecturer_courses`)
- `lib/timetable-query.ts` → session-filtered slot fetch

---

## 6. Academic session logic

```typescript
// Nigerian default calendar
getCurrentAcademicSession(); // e.g. "2025/2026" — Aug+ = new session
getCurrentSemester(); // 1 = Aug–Jan, 2 = Feb–Jul
getAcademicContext(); // { academic_session, semester }
```

Defined in:

- `uniflow-web/src/lib/academic.ts`
- `uniflow-app/lib/academic.ts`

All new reads/writes should filter by both fields.

---

## 7. Combined CSV import flow (for testing)

1. Create lecturers in uni portal with emails matching CSV.
2. Import students CSV for a department + level.
3. Go to **Departments → Timetable**.
4. Use **Combined import (recommended)** → download template → fill → upload.
5. Preview must show 0 errors → **Confirm & auto-enroll students**.
6. Sign in as student on mobile → Courses + Timetable should populate.

**API contract:**

```http
POST /api/timetable/import
{
  "university_id": "uuid",
  "department_id": "uuid",
  "csv_text": "...",
  "mode": "preview" | "commit",
  "auto_enroll": true
}
```

---

## 8. Known conflicts / backward compatibility

| Item                                             | Notes                                                                       |
| ------------------------------------------------ | --------------------------------------------------------------------------- |
| `lecturer_courses`                               | Still synced on import for legacy mobile/web paths. Remove in phase 2.      |
| `timetable.course_id` + `lecturer_id`            | Still written on import. Mobile falls back if `course_offering_id` missing. |
| `enrollments.course_id`                          | Still written alongside `course_offering_id`.                               |
| Old timetable CSV (generate → download → import) | Still on timetable page; combined import is preferred.                      |
| `u/courses` lecturer assignment UI               | Still present; should be removed when offerings page ships.                 |

---

## 9. Build commands

```bash
# Web production build
cd uniflow-web && npm run build

# Mobile (no full build required for dev)
cd uniflow-app && npx expo export --platform android  # optional
```

---

## 10. Suggested priority for next session

1. Run SQL migrations in Supabase (blocker for offerings in prod).
2. Test combined CSV import end-to-end on a dev university.
3. Build manual enrollment override UI (`POST /api/enrollments`).
4. Simplify `u/courses` page (catalog only).
5. Update `docs/uniflow-workflow.md` courses section.
6. Phase 2 cleanup: remove `lecturer_courses` dependencies.

**Note:** After the initial course offering work, significant mobile-side hardening was required for timetable, courses, dashboards and resource uploads to actually function. See `docs/timetable-courses-resources-fixes.md`.

---

## 11. Prompt to give another AI

Copy-paste this:

```
You are continuing the Uniflow monorepo (uniflow-web + uniflow-app).

Read first:
- docs/CONTINUATION.md (handoff + what's done/remaining)
- docs/course-offering-design.md (courses/timetable model)
- docs/uniflow-workflow.md (platform workflow)

The Course Offering redesign is partially implemented. SQL migrations in
uniflow-app/supabase/ MUST be run in Supabase before things work in production.
In particular run `class_updates_migration.sql` if you see errors about timetable_id column or missing columns like delay_minutes / schema cache errors (PGRST204). After running, the migration includes a NOTIFY to reload PostgREST schema.

Your tasks:
1. [Specify task from section 10 above]
2. Do not break mobile backward compatibility with lecturer_courses until phase 2.
3. Always filter timetable/enrollments/offerings by academic_session + semester.
4. Run `npm run build` in uniflow-web after changes.
```

---

## 12. Contact points in codebase (quick grep)

```bash
# Find offering usage
rg "course_offerings" uniflow-web uniflow-app

# Find legacy lecturer_courses
rg "lecturer_courses" uniflow-web uniflow-app

# Find enrollment gaps
rg "enrollments" uniflow-web/src/app/api
```

---

_Last updated: Course Offering redesign — implementation phase 1 complete, SQL + UI cleanup pending._
