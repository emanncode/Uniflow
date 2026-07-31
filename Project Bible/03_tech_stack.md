# 3. Tech Stack

## 1. Core Languages
* **TypeScript (Strict Mode):** Used for over 92% of the codebase, ensuring compile-time type-safety, strong schema verification, and clear contracts between backend Next.js API endpoints and frontend React / React Native components.
* **SQL (PostgreSQL dialects):** Custom triggers, procedural functions (PL/pgSQL), Row Level Security (RLS) policies, and performance indexes written directly in migrations for the Supabase backend.
* **Vanilla CSS / TailwindCSS:** Component-level styles and system-wide design variables.

---

## 2. Web Portal Frontend (`uniflow-web`)
* **Next.js (v16.2.4 - App Router):** Server components, route handlers, and proxy middleware for university subdomain routing.
* **React (v19.2.4) & React DOM:** Core UI rendering.
* **TailwindCSS (v4.0.0):** Modern CSS utility framework using CSS-based theme variables and PostCSS compilers.
* **Radix UI & shadcn/ui (v4.6.0):** Underpins modular, accessible, and theme-compliant UI primitives (dialogs, popovers, dropdowns, select menus).
* **Framer Motion & Motion (v12.38.0):** Powers fluid layout animations, slide-overs, and page route transitions.
* **TanStack React Query (v5.101.2):** Server state manager, handling caching, polling, and auto-refetching of dynamic dashboard statistics, university registrations, and registries.
* **Zod (v4.4.3):** Runtime type validation, primarily parsing CSV configurations, form inputs, and JSON API payloads.
* **Lucide React (v1.14.0):** Multi-purpose SVG icon library.

---

## 3. Mobile Frontend (`uniflow-app`)
* **Expo (v54.0.35) & React Native (v0.81.5):** Cross-platform native shell for iOS and Android deployment.
* **Expo Router (v6.0.24):** Type-safe file-based navigation tailored for React Native environments.
* **Zustand (v5.0.14):** Ultra-lightweight state engine, acting as the store of record for user profiles, session hydration, and authentication states.
* **TanStack React Query (v5.101.2):** Standardizes caching for timetable listings, course enrollments, class updates, and resource lists.
* **React Native Reanimated (v4.1.1):** Drives high-performance native-thread micro-interactions and transitions.
* **Shopify FlashList (v2.3.2):** High-speed list component optimizing memory footprint when loading extensive timetable days or catalog lists.
* **Expo FileSystem (v19.0.23), DocumentPicker (v14.0.8) & ImagePicker:** Local storage access, document parsing, and file conversion routines for resource uploading and profile avatars.
* **Expo Notifications (v0.32.17):** Registration, storage, and presentation of native push notification tokens and alerts.
* **Lucide React Native (v1.17.0):** React Native-optimized SVG icons.

---

## 4. Backend & Database Infrastructure
* **Supabase (PostgreSQL 15+):** Relational storage engine with integrated Auth, real-time channels, and storage bucket handlers.
  * **Supabase SSr (`@supabase/ssr`):** Cookie-based session validation across subdomains and server components in Next.js.
  * **Row Level Security (RLS):** Policies mapped to profiles, ensuring users can only read or write rows belonging to their specific university or assigned courses.
  * **Custom Security Definer Helpers:** Bypasses RLS limits to resolve relational bindings (e.g. checking if a student is enrolled via `check_student_enrolled_by_course()`) avoiding infinite recursion cycles.
  * **Storage Buckets:**
    * `avatars`: Publicly readable bucket storing cropped user profile avatars.
    * `resources`: Authenticated-write bucket storing PDFs, worksheets, and documents.
* **Resend API (v6.14.0):** Dynamic transactional email dispatcher (onboarding invitations, password reset handles).
* **Vercel Hosting:** Target deployment environment for the web admin and API route handlers.
* **EAS Build & Submit:** Automation pipeline packaging the mobile app into native Android (APK/AAB) and iOS (IPA) formats.
