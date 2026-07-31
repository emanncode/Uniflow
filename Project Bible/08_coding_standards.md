# 8. Coding Standards

To maintain clean architecture and ensure seamless integration across both web and mobile environments, developers and AI agents must adhere to the following standards.

---

## 1. Naming Conventions

### File Naming
* **React Web Components (PascalCase):** E.g. `CombinedTimetableImport.tsx`, `FacultySelector.tsx`.
* **Hooks and Helpers (camelCase):** E.g. `useStudentEnrollments.ts`, `academic.ts`.
* **Subdomain Route Pages (lowercase/directory):** Next.js App router standard (e.g. `app/(university)/u/timetable/page.tsx`).
* **Mobile Router Screens (kebab-case):** Expo Router standard (e.g. `forgot-password.tsx`, `timetable.tsx`).
* **Database Migrations (snake_case):** SQL files stored in `supabase/` (e.g. `course_offerings_migration.sql`).

### Variable & Class Naming
* **TypeScript Types & Interfaces:** PascalCase (e.g. `CourseOffering`, `AcademicContext`).
* **TypeScript Variables/Functions:** camelCase (e.g. `getAcademicContext`, `isSuperAdmin`).
* **Database Tables & Columns:** snake_case (e.g. `course_offering_id`, `is_active`).

---

## 2. TypeScript & Type Safety
* **Strict Type Safety:** Always compile with `strict: true`. Avoid utilizing the `any` fallback type. Use `unknown` or declare exact type schemas.
* **Database Schema Definitions:** Re-use the types from [types/index.ts](file:///home/emanncode/Documents/code/uniflow/uniflow-app/types/index.ts) which map 1-to-1 with Supabase schemas.
* **API Payload Validation:** Validate incoming request payloads in API Route Handlers using Zod schemas before processing DB mutations.

---

## 3. React & Next.js Architecture
* **Server Components First:** In `uniflow-web`, write files as React Server Components (RSC) by default to minimize client bundle sizes. Only prepend `"use client"` when managing states, triggers, hooks, or accessing DOM objects.
* **Server State Management:** Do not implement manual fetch requests within client-side `useEffect` triggers. Use TanStack React Query (`useQuery` / `useMutation`) for caching, refetching, and error-boundary management.
* **Global App State:** Restrict global store models to Zustand (E.g. authentication/session state inside [useAuthStore.ts](file:///home/emanncode/Documents/code/uniflow/uniflow-app/store/useAuthStore.ts)). Keep component-level values scoped to native `useState`.

---

## 4. React Native (Expo) Conventions
* **Theme Variables Adherence:** Do not write hardcoded color hashes or corner radii in React Native style declarations. Always import and apply constants from [Theme.ts](file:///home/emanncode/Documents/code/uniflow/uniflow-app/constants/Theme.ts).
* **Robust File Handling:** React Native file selectors generate complex `file://` or `content://` URIs. When uploading files, do not use simple `fetch(uri).blob()`. Use standard `FormData` or buffer reads via `Expo.FileSystem`.
* **Optimized Rendering:** For layouts displaying timetables or catalogs, prefer `@shopify/flash-list` over standard `FlatList` to optimize memory usage.

---

## 5. Documentation & Comments
* **Comment Integrity:** Keep all existing docstrings, header blocks, and inline explanations that are unrelated to your current file changes.
* **Relational Security Annotations:** Document why a database function uses `SECURITY DEFINER` bypass policies (e.g. "Prevents RLS recursion when reading student enrollment loops").
* **Commit Messages:** Follow basic Conventional Commits (e.g. `feat: add auto-enrollment exceptions`, `fix: mobile resource upload crash`). Keep messages descriptive and concise.
