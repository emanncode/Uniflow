# Timetable, Courses & Resources — Mobile Fixes

**Date:** 2026-07-03  
**Context:** After the course_offerings redesign, the mobile lecturer and student experiences for timetables, courses, dashboards, and resource uploads were broken or unreliable.

This document records the issues discovered and the fixes applied.

---

## Summary of Issues

### 1. Timetable / "Today's Classes" / Courses completely empty

- Lecturer home ("Today's Classes", Upcoming, stats)
- Student home (same)
- `/timetable` tabs for both roles
- `/courses` tabs for both roles

Nothing appeared even when data existed in the `timetable` table.

### 2. Lecturer resource uploads stuck loading

Clicking "Upload Resource" would show the loading state ("Uploading file...") but never complete, never error visibly, and never save the resource.

---

## Root Causes

### Timetable / Courses / Dashboards

| Problem | Impact |
|---------|--------|
| `fetchTimetableSlots()` in `lib/timetable-query.ts` prioritized `course_offering_id IN (...)` when offerings were present | Most timetable rows had `course_offering_id = NULL` (especially rows created via manual admin UI) → 0 results |
| Strict `.eq("academic_session")` + `.eq("semester")` with no fallback | Data created under different sessions or before the session logic was wired up was invisible |
| `useLecturerCourseIds()` only consulted `course_offerings` then `lecturer_courses` | If neither had rows for the current computed session, course lists were empty even when `timetable` had `lecturer_id` matches |
| Web admin paths (quick-add slot, create course + slot) never created `course_offering` rows or set `course_offering_id` on timetable | New data kept arriving in the "legacy" shape |
| `TODAY_NAME` / `TODAY_KEY` computed at module top level | Stale "today" values after hot reloads |
| Imprecise Supabase relation joins (`profiles(full_name)` instead of `profiles:lecturer_id(...)`) | Lecturer names missing on student side |
| No resilience when current academic context produced zero rows | Users saw permanent empty states |

### Resources Upload

| Problem | Impact |
|---------|--------|
| Naive `fetch(file.uri).then(r => r.blob())` + direct `upload(blob)` | Extremely unreliable on RN (file:// and content:// URIs). Often hung or produced empty payloads |
| No `resources` storage bucket setup script existed (only `avatars_storage.sql`) | Uploads failed with "bucket not found" or permission errors |
| **No RLS INSERT policy** for lecturers on the `resources` table | Only university admins had any policy. Lecturer inserts were rejected by RLS |
| Hardcoded `academic_session` instead of `getAcademicContext()` | Inconsistent with the rest of the app |
| Poor error surfacing | Failures were silent or unhelpful |

---

## Changes Made

### 1. `uniflow-app/lib/timetable-query.ts`

- Reordered filter priority:
  - `lecturerId` → use `lecturer_id` (most reliable for lecturers)
  - `courseIds` → use `course_id`
  - `offeringIds` → only as last resort
- Added automatic fallback query **without** academic session/semester when the filtered query returns 0 rows.
- Richer debug logging (including all timetable rows for a lecturer).
- Fixed relation syntax: `profiles:lecturer_id(full_name)`.

### 2. `uniflow-app/hooks/useLecturerCourseIds.ts`

- Added `loadFromTimetable()` fallback.
- Multi-stage fallback chain: offerings → legacy → timetable → any-session timetable scan.
- This allows "My Courses" and dashboard stats to work even when assignment tables are empty for the current session.

### 3. Web admin inserts (data creation)

- `uniflow-web/src/app/(university)/u/timetable/page.tsx` (quick add)
- `uniflow-web/src/app/(university)/u/courses/page.tsx` (create with slot)
- Now create/find a matching `course_offering` and set `course_offering_id` on the new timetable row.
- `/api/lecturer-courses` route now also calls `upsertCourseOffering()`.

### 4. Dynamic "today" computation

- `TODAY_NAME` / `TODAY_KEY` moved to functions (`getTodayName()`, `getTodayKey()`) called at render/fetch time in all home + timetable screens (both roles).

### 5. Resource uploads — robust client

- Replaced blob upload with the proven pattern from `lib/avatar.ts`:
  - Primary: `FormData` + native URI (best for RN)
  - Fallback: direct REST upload using `FileSystem.readAsStringAsync` + Uint8Array
- Helpful error messages that mention missing bucket or RLS.
- Aligned `academic_session` with `getAcademicContext()`.

### 6. Backend (Supabase)

**New file:** `uniflow-app/supabase/resources_storage.sql`
- Creates (or fixes) the `resources` bucket as public.
- Adds storage policies for authenticated uploads + public downloads.

**Updated:** `uniflow-app/supabase/mobile_read_rls.sql`
- Enabled RLS on `resources`.
- Added lecturer INSERT policy (tied to `auth_lecturer_course_ids()`).
- Added "manage own uploads" policy for lecturers.
- Added read policy for approved resources by university members.
- Improved `auth_lecturer_course_ids()` to union `course_offerings` + `lecturer_courses`.

---

## Files Touched

### Mobile App

- `lib/timetable-query.ts`
- `hooks/useLecturerCourseIds.ts`
- `hooks/useStudentEnrollments.ts` (minor)
- `app/(lecturer)/index.tsx`, `timetable.tsx`, `courses.tsx`
- `app/(student)/index.tsx`, `timetable.tsx`, `courses.tsx`
- `app/(lecturer)/resources.tsx`
- `app/(student)/resources.tsx` (join fix)

### Web

- `src/app/(university)/u/timetable/page.tsx`
- `src/app/(university)/u/courses/page.tsx`
- `src/app/api/lecturer-courses/route.ts`

### SQL / Docs

- `supabase/resources_storage.sql` (new)
- `supabase/mobile_read_rls.sql`
- This document

---

## Required Actions for Existing Projects

After pulling these changes, run in Supabase SQL Editor:

```sql
-- 1. Storage bucket + policies
\i uniflow-app/supabase/resources_storage.sql

-- 2. Table policies + improved helper function
\i uniflow-app/supabase/mobile_read_rls.sql
```

Re-apply the RLS file even if you ran it before — it now contains the lecturer resource policies.

---

## Related Existing Documentation

- `docs/course-offering-design.md` — the original redesign that introduced `course_offerings`
- `docs/CONTINUATION.md`
- `memory/progress.md`

---

## Recommendations / Future Cleanup

- Once most data flows through `course_offerings`, we can remove the fallbacks in `fetchTimetableSlots` and the hooks.
- Consider adding a storage policy that restricts uploads to actual course lecturers (using a SECURITY DEFINER helper) instead of "any authenticated".
- Add `semester` to the `Resource` model if we want per-semester resource scoping later.
- The Phase 2 cleanup items listed at the bottom of `course-offering-design.md` are still relevant.

---

**This work made the mobile timetable, courses, and resource features actually functional after the course offering model was introduced.**