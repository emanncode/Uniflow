# 11. Progress Log

*Maintain this log after every development session to keep succeeding developers and AI agents aligned on the project status.*

---

## Session: 2026-07-31

### What Was Completed
* **Project Bible Initialization:** Created the modular documentation folder (`Project Bible/`) containing structured, high-fidelity files for the platform Vision, Features list, Tech Stack specs, Folder Architecture diagram, Database Design details, API specs, UI design constraints, Coding Standards, Roadmap milestones, and AI instructions.
* **TOC Creation:** Compiled a root `README.md` in the Project Bible folder to index all chapters using clickable absolute local paths.
* **Core Offering Redesign Phase 1:** Set up database tables (`course_offerings`), combined CSV timetable import utilities, auto-enrollment workflows, and mobile query hooks fallback logic.
* **Mobile Stability Hardening:** Fixed broken timetable/course queries on mobile, implemented resilient academic session fallbacks, and resolved lecturer resource upload freezes by switching React Native uploads to standard FormData/FileSystem buffers.

### What Changed
* Changed project documentation structure, moving general architectural specs into the dedicated `Project Bible/` folder for clear developer onboarding.
* Centralized timetable schedules and student enrollments under `course_offerings` instead of direct isolated course associations.

### New Decisions
* **Modular Docs:** Chose a multi-file folder structure for the Project Bible to keep files readable and prevent single-file bloat.
* **Legacy Mappings Preservation:** Retained legacy database columns (e.g. `timetable.course_id`) during Phase 1 to support backward compatibility with older client builds.

### Known Bugs / Risks
* **Production Database Cache Sync:** RLS functions and new columns must be run in the production Supabase editor before deploying frontend web portal updates.

### Next Tasks
1. Run SQL migrations in the Supabase Dashboard:
   * [class_updates_migration.sql](file:///home/emanncode/Documents/code/uniflow/uniflow-app/supabase/class_updates_migration.sql)
   * [course_offerings_migration.sql](file:///home/emanncode/Documents/code/uniflow/uniflow-app/supabase/course_offerings_migration.sql)
   * [course_offerings_rls_clean.sql](file:///home/emanncode/Documents/code/uniflow/uniflow-app/supabase/course_offerings_rls_clean.sql)
2. Refactor the university admin courses dashboard (`u/courses`) to be catalog-only, eliminating the legacy lecturer assignment forms.
3. Build manual enrollment override APIs (`POST /api/enrollments`) and UI.
