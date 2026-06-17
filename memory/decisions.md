# Decisions

## Session End Workflow

Before finishing any chat:

1. Run build-time checks for **both** projects:
   - Web: `cd uniflow-web && npm run build`
   - App: `cd uniflow-app && npx tsc --noEmit` (and `npm run lint` when relevant)
2. If errors exist → fix them, then commit and push.
3. If no errors → commit and push any uncommitted changes.

Reason:
User-requested quality gate so broken builds never land on `main`.

---

## Design

Accent Colors

- Blue: #2563eb
- Gold: #fbbf24

Reason:
Approved final branding.

---

Background

- Deep Navy #070d1a

Reason:
Better than pure black.

---

Font

- Sora

Reason:
Consistent branding.

---

Mobile Framework

- Expo Managed Workflow

Reason:
Faster iteration.

---

Auth

Admin:
- Email + Password + OTP

Lecturer:
- Email + Password

Student:
- Email + Password

Reason:
Keep mobile authentication simple.

---

Data Source

Rule:
Never use dummy data.

All data comes from Supabase.