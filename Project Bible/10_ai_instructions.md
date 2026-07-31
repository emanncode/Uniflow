# 10. AI Instructions

> [!IMPORTANT]
> **Instructions for AI Coding Assistants**
> Read this document completely before modifying any code or files in the Uniflow codebase.

---

## 1. Design-First UI Workflows (Strictly Required)
* **Pencil Design Files:** You must review the current mockups inside [design/uniflow-mobile.pen](file:///home/emanncode/Documents/code/uniflow/design/uniflow-mobile.pen) before writing or refactoring any visual user interfaces.
* **Approval Gate:** Do not implement UI code in the application folders (`uniflow-web` or `uniflow-app`) until the user explicitly reviews and approves the Pencil designs.
* **Fidelity Match:** Implement the design matching the approved layout, spacing values, theme colors, and copy structure.

---

## 2. Coding & Architecture Rules
* **Strict TypeScript:** Keep strict mode active. Never resort to using `any` types. Declare interfaces or use types exported in [types/index.ts](file:///home/emanncode/Documents/code/uniflow/uniflow-app/types/index.ts).
* **Next.js Routing and Proxy:** Subdomain routing and auth guards are controlled inside [proxy.ts](file:///home/emanncode/Documents/code/uniflow/uniflow-web/src/proxy.ts). Always refer to this file when adjusting access rules or rewriting URLs.
* **Next.js Server Components:** Prefer React Server Components (RSC) by default. Use `"use client"` only when incorporating browser interactions (e.g. `onClick`, hooks, Framer Motion).
* **Zustand for App State:** In React Native, keep global authentication and session credentials stored in the `useAuthStore` container. Do not declare duplicate global stores.
* **Maintain Comment Blocks:** Preserve all existing files' comments, docstrings, and explanation headers, especially when refactoring unrelated lines.

---

## 3. Database & Query Standards
* **Row Level Security (RLS) Safety:** Database access checks must respect university and role boundaries. Remember that university admins, lecturers, and students can only query assets linked to their specific `university_id`.
* **Security Definer Helpers:** When creating database functions that require querying enrollments or course offerings across tables, specify `SECURITY DEFINER` and set the search path to `public`. This prevents Infinite Recursion errors in policy checks.
* **Academic Session Filters:** Always filter timetable slots, course offerings, and enrollment records by the active `academic_session` (e.g., `"2025/2026"`) and `semester` (e.g., `1` or `2`) as calculated by `getAcademicContext()`.
* **Backward Compatibility:** Do not delete legacy columns (like `timetable.course_id`, `timetable.lecturer_id`, or the `lecturer_courses` table) until the transition to `course_offerings` has been completed and verified.

---

## 4. Verification Routine
* After changing web portal code, run:
  ```bash
  cd uniflow-web && npm run build
  ```
* After changing mobile application code, run:
  ```bash
  cd uniflow-app && npm run lint
  ```
