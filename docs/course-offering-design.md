# Course Offering Design

How courses, timetables, and student enrollments are linked after the redesign.

---

## Why we changed it

| Old problem | Fix |
|-------------|-----|
| No way to enroll students (empty mobile app) | Auto-enroll by department + level after CSV import |
| `lecturer_courses` vs `timetable.lecturer_id` diverged on mobile | Single hub: `course_offerings` |
| No academic session filtering | `getAcademicContext()` on all reads |
| Three-step admin setup (courses → assign lecturer → timetable) | One combined CSV |

---

## Entity diagram

```
departments
    └── courses (catalog: code, title, level, semester, credits)
            └── course_offerings (runtime: + lecturer + session + semester)
                    ├── timetable (0..n slots: day, time, venue)
                    └── enrollments (students auto-matched by level)
```

### `course_offerings`

| Column | Purpose |
|--------|---------|
| `course_id` | Catalog course |
| `lecturer_id` | Who teaches this session |
| `department_id` | Scope for admin + auto-enroll |
| `academic_session` | e.g. `2025/2026` |
| `semester` | `1` or `2` |
| Unique | `(course_id, lecturer_id, academic_session, semester)` |

### `timetable`

Now includes `course_offering_id` (FK). Legacy `course_id` + `lecturer_id` kept during migration.

### `enrollments`

Now includes `course_offering_id` (FK). Legacy `course_id` kept during migration.

---

## Admin CSV (one file)

```csv
course_code,course_title,level,semester,credit_units,lecturer_email,day,start_time,end_time,venue
CSC301,Data Structures,300,1,3,lecturer@uni.edu,Monday,08:00,10:00,LT1
CSC301,Data Structures,300,1,3,lecturer@uni.edu,Wednesday,14:00,16:00,Lab2
MTH201,Linear Algebra,200,1,3,prof@uni.edu,,,,
```

| Row type | Result |
|----------|--------|
| Full schedule row | Upsert course → offering → slot |
| Blank day/time row | Upsert course → offering only |
| Duplicate code+email | Same offering, extra slot |

**After commit:** `autoEnrollDepartment()` enrolls active students where:
- `profiles.department_id` = import department
- `profiles.level` = course.level
- offering `semester` = current semester

Manual override (planned): enroll/unenroll individual students per offering in UI.

---

## Mobile query paths

### Student

```
enrollments (session + semester)
  → course_offerings (optional)
  → courses
  → timetable slots (by offering_id, fallback course_id)
```

Hooks: `useStudentEnrollments()` → `{ courseIds, offeringIds }`  
Helper: `lib/timetable-query.ts`

### Lecturer (dean/hod included)

```
course_offerings (lecturer_id = me, session + semester)
  → courses + timetable slots
```

Falls back to `lecturer_courses` if offerings table empty (pre-migration).

Hook: `useLecturerCourseIds()` → `{ courseIds, offeringIds }`

---

## APIs

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/timetable/import` | POST | Combined CSV preview/commit |
| `/api/enrollments/auto` | POST | Re-run auto-enroll for department |
| `/api/course-offerings` | GET | List offerings for admin UI |

Server libs:
- `uniflow-web/src/lib/course-offerings-server.ts`
- `uniflow-web/src/lib/enrollments-server.ts`
- `uniflow-web/src/lib/combined-timetable-csv.ts`

---

## SQL files (run in Supabase)

1. `uniflow-app/supabase/course_offerings_migration.sql` — table + columns + backfill
2. `uniflow-app/supabase/course_offerings_rls.sql` — policies

---

## Phase 2 cleanup (not done)

- Remove lecturer assignment from `u/courses` page
- Drop `lecturer_courses` table
- Drop legacy columns on `timetable` and `enrollments`
- Remove `syncLegacyLecturerCourse()` from import API

See `docs/CONTINUATION.md` for full handoff checklist.

**Related:** `docs/timetable-courses-resources-fixes.md` — details the mobile consumption bugs and resource upload fixes discovered after the redesign shipped.