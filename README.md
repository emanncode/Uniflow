# Uniflow — Academic Coordination Platform

<div align="center">

[![Uniflow Banner](https://img.shields.io/badge/Uniflow-Academic%20Coordination-blue?style=for-the-badge)](https://uniflowapp.xyz)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge)](https://www.typescriptlang.org/)
[![Status](https://img.shields.io/badge/Status-Active%20Development-success?style=for-the-badge)](#)

Uniflow is a comprehensive university coordination platform featuring a dual-interface model: a multi-tenant administration web portal for institutions, and a real-time mobile application built for students and lecturers to streamline daily campus scheduling and resources.

[Live Demo Website](https://uniflowapp.xyz) • [GitHub Issues](https://github.com/Emann-Code-01/Uniflow/issues) • [Project Bible](./Project%20Bible/README.md)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [User Roles & Access](#-user-roles--access)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Local Development](#local-development)
  - [Supabase Configuration](#supabase-configuration)
- [Deployment](#-deployment)
- [Developer Resources](#-developer-resources)
- [License](#-license)

---

## 🎯 Overview

Higher education coordination is often plagued by communication gaps. Class timetables are typically static PDFs or paper notice sheets. Room allocations, lecturer delays, or class cancellations are distributed across fragmented channels (like WhatsApp, emails, or bulletin boards) with zero real-time visibility.

**Uniflow** bridges this coordination gap by linking:
1. **Uniflow Super Admin**: Platform operators onboard and manage universities.
2. **University Admin Portal**: Institutional admins manage faculties, departments, courses, timetables, and user directories under custom subdomain hosts.
3. **Mobile Application**: Students and lecturers view personalized timetables, exchange learning resources, and report/verify live class status changes.

---

## ✨ Key Features

### 🖥️ Multi-Tenant Web Administration
* **University Onboarding**: Streamlined Super Admin portal to approve and set up new institutions, triggering automated subdomain creation and onboarding emails.
* **Academic Directory CRUD**: Full setup of Faculties, Departments, and Courses. Supports assigning Deans to Faculties and HODs to Departments.
* **Combined Timetable & Course Offerings Scheduler**: Import a single, structured CSV sheet containing courses, lecturers, times, and classrooms. The backend automatically populates catalog items, links lecturer assignments, and creates weekly schedules.
* **Auto-Enrollments Engine**: Instantly registers students to course offerings matching their department, level, and current semester bounds.
* **Roster Management**: Manage lecturer and student directories, execute bulk CSV uploads, and trigger password reset links.

### 📱 Student & Lecturer Mobile App
* **Today's Classes & Schedules**: Fast, real-time timetable dashboard showing current day slots and upcoming weekly calendars.
* **Live Class Updates**: Lecturers can broadcast class delays (specifying minutes), relocations, or cancellations.
* **Crowdsourced Reports & Upvoting**: Students can submit live updates (e.g., "Lecturer not in class"), which enrolled peers can upvote to verify and prevent spam.
* **Resource Sharing**: Lecturers upload PDF/image study guides directly to course offering folders, and students download them in-app.
* **Smart Session Filtering**: All timetables, courses, and resources automatically filter according to the active academic session (e.g., `2025/2026`) and semester (e.g., `1` or `2`).

---

## 🛠️ Architecture & Tech Stack

Uniflow is organized as a monorepo leveraging a shared Supabase Postgres instance.

### 💻 Web Portal (`uniflow-web`)
* **Framework**: Next.js 16 (App Router) & React 19
* **Styling**: TailwindCSS 4.0 & shadcn/ui (Radix UI)
* **Animation**: Framer Motion (Motion)
* **State & Fetching**: TanStack React Query & Zod validation
* **Mailing Service**: Resend API

### 📱 Mobile Application (`uniflow-app`)
* **Shell**: Expo 54 & React Native 0.81
* **Routing**: Expo Router 6.0 (File-based layouts)
* **Local State**: Zustand & TanStack Query caching
* **Performance**: Shopify FlashList for fast timetable scrolling
* **Push Notifications**: Expo Notifications service

### ⚙️ Database & Infrastructure
* **Engine**: Supabase (PostgreSQL 15+)
* **Security**: Row Level Security (RLS) policies scoped by university tenant boundaries and course enrollment statuses.
* **Media Assets**: Supabase Storage Buckets (`avatars` and `resources`).

---

## 👥 User Roles & Access

| Role | Web Access | Mobile Access | Scope / Navigation |
|---|---|---|---|
| `uniflow_admin` | ✅ Super Dashboard | ❌ Blocked | Platform operations and tenant onboarding. |
| `university_admin` | ✅ `{tenant}-admin` Subdomain | ❌ Blocked | University setup, directories, and schedules. |
| `lecturer` | ❌ Blocked | ✅ `(lecturer)` Scope | Viewing teaching calendars, resource uploads, class status alerts. |
| `dean` | ❌ Blocked | ✅ `(lecturer)` Scope | Faculty representation, shares lecturer UI. |
| `hod` | ❌ Blocked | ✅ `(lecturer)` Scope | Department representation, shares lecturer UI. |
| `student` | ❌ Blocked | ✅ `(student)` Scope | Accessing timetables, downloading resources, upvoting reports. |

---

## 📁 Project Directory Structure

```
uniflow/
├── design/                 # Pencil UI design canvas files (*.pen)
├── docs/                   # General platform guides & architectural redesigns
├── Project Bible/          # Standard developer documentation chapters
├── uniflow-app/            # Expo / React Native mobile app client
│   ├── app/                # File-based navigation routes
│   ├── components/         # Reusable UI widgets
│   ├── hooks/              # Query hooks, push notifications, and camera utilities
│   ├── lib/                # Auth verification and academic session compilers
│   └── supabase/           # SQL migration files and RLS policy scripts
└── uniflow-web/            # Next.js web portals & serverless API routes
    ├── src/
    │   ├── app/            # App Router (university portals, APIs, Super Admin)
    │   ├── components/     # shadcn primitives and timetable import components
    │   ├── lib/            # Auth gates, domain parsers, and Resend integrations
    │   └── proxy.ts        # Subdomain rewrite middleware and route guards
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** or **yarn** package manager
* **Expo CLI** (for mobile debugging): `npm install -g expo-cli`
* A **Supabase** project instance (for Database, Auth, and Storage buckets)

### Installation
Clone the repository:
```bash
git clone https://github.com/Emann-Code-01/Uniflow.git
cd Uniflow
```

### Local Development

#### 1. Web Portal & APIs (`uniflow-web`)
Navigate into the directory, copy the env file, and run:
```bash
cd uniflow-web
cp .env.local.example .env.local  # Set your Supabase keys, Domain, & Resend API Key
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
* Local Super Admin Subdomain: `admin.localhost:3000`
* Local University Portal Subdomain: `{shortname}-admin.localhost:3000`

#### 2. Mobile App (`uniflow-app`)
Navigate into the directory and launch the bundler:
```bash
cd uniflow-app
npm install
npx expo start
```
* Press `a` for Android Emulator.
* Press `i` for iOS Simulator.
* Scan the QR code using the Expo Go application on a physical device.

---

### Supabase Configuration

Execute the SQL migration scripts located in `uniflow-app/supabase/` within the Supabase SQL editor in the following order:
1. `courses_rls.sql`
2. `department_levels.sql`
3. `timetable_department_fk.sql`
4. `profiles_rls_fix.sql`
5. `class_updates_migration.sql` (Creates delay settings and updates parameters)
6. `mobile_read_rls.sql` (Restructures mobile querying access)
7. `course_offerings_migration.sql` (Sets up the live runtime offering catalog model)
8. `course_offerings_rls.sql` (Initializes secure row policies for offerings and enrollments)

**Auth Redirect URLs**: Setup the following redirect routes in your Supabase authentication console:
* `https://uniflowapp.xyz/reset-password**`
* `https://*-admin.uniflowapp.xyz/**`

---

## 📦 Deployment

### Web Portal (Next.js)
Uniflow-web is optimized for deployment on **Vercel** with wildcard subdomain support enabled.
Ensure that environmental variables (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, etc.) are configured in your Vercel project settings.

### Mobile App (Expo)
Deploy using Expo Application Services (EAS):
```bash
cd uniflow-app
eas build --platform all
```

---

## 📖 Developer Resources

For a deeper dive into the system logic:
* **[Uniflow Feature Specification](./full_on_feature.md)**: Deep dive into architecture, domain logic, and databases.
* **[Project Bible Index](./Project%20Bible/README.md)**: Absolute local sitemap indexing all chapters (Vision, Features, API, UI systems).
* **[Uniflow Workflow Blueprint](./docs/uniflow-workflow.md)**: Detailed trace of user onboarding and subdomain rewriting middleware.
* **[AI Continuation Guide](./docs/CONTINUATION.md)**: Essential context and current priorities for incoming developers or AI pairs.

---

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.
