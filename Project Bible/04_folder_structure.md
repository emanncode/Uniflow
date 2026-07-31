# 4. Folder Structure

The Uniflow project is organized as a monorepo containing the administrative web application (`uniflow-web`) and the React Native mobile application (`uniflow-app`).

```
uniflow/
├── design/                            # UI Design files (Open in VS Code)
│   ├── starter.pen                    # Starter canvas for layouts
│   ├── uniflow-mobile.pen             # Primary mobile design boards
│   └── build-uniflow-pen.py           # Design building helper script
├── docs/                              # Project documentation
│   ├── CONTINUATION.md                # AI developer handoff instructions
│   ├── course-offering-design.md      # Timetable-Course offering database architecture
│   ├── timetable-courses-resources-fixes.md  # Mobile bugs and storage fixes logs
│   └── uniflow-workflow.md            # Platform overview and workflow walkthrough
├── memory/                            # Architecture memories (prefer docs/ files)
├── uniflow-app/                       # Mobile Application (Expo / React Native)
│   ├── .eas/                          # EAS mobile builds configuration
│   ├── app/                           # Expo Router file-based pages
│   │   ├── (lecturer)/                # Lecturer App navigation scope
│   │   │   ├── _layout.tsx            # Lecturer tabs layout definitions
│   │   │   ├── index.tsx              # Lecturer homepage (Today's classes, stats)
│   │   │   ├── timetable.tsx          # Timetable view for lecturers
│   │   │   ├── courses.tsx            # Courses taught by lecturer
│   │   │   ├── resources.tsx          # Upload learning assets panel
│   │   │   ├── notifications.tsx      # In-app notifications list
│   │   │   └── profile.tsx            # Lecturer profile metadata
│   │   ├── (student)/                 # Student App navigation scope
│   │   │   ├── _layout.tsx            # Student tabs layout definitions
│   │   │   ├── index.tsx              # Student homepage (Today's classes, progress)
│   │   │   ├── timetable.tsx          # Timetable view for students
│   │   │   ├── courses.tsx            # Student enrolled courses list
│   │   │   ├── resources.tsx          # Download class assets viewer
│   │   │   ├── notifications.tsx      # In-app notifications list
│   │   │   └── profile.tsx            # Student profile details
│   │   ├── _layout.tsx                # Root layout (AuthGuard router, Hydrator)
│   │   ├── login.tsx                  # Mobile sign-in screen (blocks web admins)
│   │   └── forgot-password.tsx        # Mobile self-service password reset form
│   ├── assets/                        # Local image assets, fonts, and icons
│   ├── components/                    # Reusable React Native UI components
│   ├── constants/                     # Styling constraints
│   │   └── Theme.ts                   # Colors, font variables, and border radius properties
│   ├── hooks/                         # React Native custom query integration
│   │   ├── useAvatarPicker.ts         # Handles photo picking, cropping and uploads
│   │   ├── useLecturerCourseIds.ts    # Queries courses taught with legacy/timetable fallback
│   │   ├── useStudentEnrollments.ts   # Queries student course enrollment IDs
│   │   ├── usePushNotifications.ts    # Token registration and push alerts setup
│   │   └── useUnreadNotificationCount.ts  # Realtime notification badge calculator
│   ├── lib/                           # Core utilities
│   │   ├── academic.ts                # Session/semester logic (`2025/2026`, semester 1/2)
│   │   ├── avatar.ts                  # Avatar image payload converters
│   │   ├── enrichProfile.ts           # Resolves Dean/HOD relational details on login
│   │   ├── role-access.ts             # Enforces app-level role privileges
│   │   ├── supabase.ts                # Supabase client instantiation
│   │   └── timetable-query.ts         # High-resilience timetable fetch queries
│   ├── store/                         # Global state
│   │   └── useAuthStore.ts            # Hydrates user session and checks profile roles
│   ├── supabase/                      # Database evolution assets
│   │   ├── class_updates_migration.sql # class_updates table amendments
│   │   ├── course_offerings_migration.sql # new offerings architecture
│   │   ├── mobile_read_rls.sql        # RLS definitions for mobile queries
│   │   ├── performance_indexes.sql    # Database speed optimization scripts
│   │   └── resources_storage.sql      # Storage buckets and asset upload RLS
│   └── types/                         # TypeScript interfaces
│       └── index.ts                   # Database tables, courses and profiles types
│
└── uniflow-web/                       # Web Portal & API Handlers (Next.js)
    ├── public/                        # Marketing landing assets, SVG icons
    ├── src/                           # Source root
    │   ├── proxy.ts                   # Proxy server handling subdomain rewrites & auth guards
    │   ├── app/                       # Next.js App Router routing table
    │   │   ├── (university)/          # University subdomain route boundary
    │   │   │   ├── layout.tsx         # University shell styling wrapper
    │   │   │   └── u/                 # Under-the-hood proxy pages mapping subdomains
    │   │   │       ├── page.tsx       # University Admin homepage (Overview, stats)
    │   │   │       ├── faculties/     # CRUD interface for Faculties
    │   │   │       ├── departments/   # CRUD interface for Departments
    │   │   │       ├── courses/       # Catalog courses configuration
    │   │   │       ├── timetable/     # Weekly timetable and CSV upload trigger
    │   │   │       ├── students/      # Student directory & bulk uploads
    │   │   │       ├── lecturers/     # Staff directory & bulk uploads
    │   │   │       └── settings/      # Portal profile adjustments
    │   │   ├── api/                   # Serverless route handlers (Backend API)
    │   │   │   ├── approve-university/ # Super Admin university onboarding hook
    │   │   │   ├── create-staff/      # University Admin user onboarding hook
    │   │   │   ├── enrollments/auto/  # Dynamic auto-enrollment compiler
    │   │   │   ├── timetable/import/  # Combined CSV parser
    │   │   │   └── public/            # Public endpoints (forgot password proxy)
    │   │   ├── dashboard/             # Super Admin dashboard pages (`admin.*`)
    │   │   ├── login/                 # Super Admin and Apex credentials collector
    │   │   ├── register/              # Marketing registration form
    │   │   └── reset-password/        # Centralized password reset handling page
    │   ├── components/                # React components catalog
    │   │   ├── ui/                    # shadcn system primitives
    │   │   └── university/            # Timetable import widgets
    │   └── lib/                       # Core server helper libraries
    │       ├── academic.ts            # Academic Session calculations
    │       ├── auth.ts                # Permission checkers (`isSuperAdmin`, etc.)
    │       ├── combined-timetable-csv.ts # Timetable parser parser engines
    │       ├── email.ts               # Resend payload templates and triggers
    │       ├── enrollments-server.ts  # Database enrollment compilers
    │       ├── password-reset.ts      # Redirect URL generators
    │       ├── role-access.ts         # Portal-to-role policy verifiers
    │       └── subdomain.ts           # Subdomain extractors
```
