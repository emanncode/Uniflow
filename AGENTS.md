<!-- BEGIN:nextjs-agent-rules -->
# Uniflow-Web Agent Instructions

## ⚠️ Critical: This is NOT Standard Next.js

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. **Read the relevant guide in `node_modules/next/dist/docs/` before writing any code.** Heed deprecation notices.

## Project Overview

Uniflow-Web is a multi-tenant admin dashboard built with Next.js 16.2.4, React 19.2.4, and Supabase. It uses subdomain-based routing for university-specific portals.

- **Tech Stack**: Next.js (App Router), Tailwind CSS 4, shadcn/ui, Supabase SSR, Framer Motion
- **Architecture**: Multi-tenant with subdomain routing ([src/lib/subdomain.ts](src/lib/subdomain.ts))
- **Styling**: Dark theme with custom CSS variables ([src/app/globals.css](src/app/globals.css))

## Essential Commands

```bash
npm run dev    # Start dev server (:3000)
npm run build  # Production build
npm run lint   # ESLint check
npm start      # Production server
```

## Key Conventions

- **Components**: PascalCase, mark client components with `'use client'`
- **Styling**: Use `cn()` helper for Tailwind class merging
- **Supabase**: Server components use `createSupabaseServer()`, client use imported `supabase`
- **Auth**: Dashboard routes protected via [DashboardClientWrapper](src/components/layout/DashboardClientWrapper.tsx)
- **Icons**: Lucide React
- **Forms**: Use FieldWrapper pattern

## Architecture Patterns

- **Subdomain Routing**: `getSubdomain()`, `isSuperAdmin()`, `isUniversityPortal()`
- **Force-Dynamic Rendering**: All routes use dynamic rendering
- **SSR Auth**: Use server Supabase client for secure operations

## Common Pitfalls

- Wrong Supabase client usage (browser vs server)
- Forgetting `'use client'` in interactive components
- Not handling multi-tenant routing
- Breaking Tailwind merging (always use `cn()`)
- Assuming standard Next.js patterns

## Links

- [README.md](README.md) - Basic setup
- [components.json](components.json) - shadcn/ui config
- [tsconfig.json](tsconfig.json) - TypeScript paths
- [eslint.config.mjs](eslint.config.mjs) - Linting rules
<!-- END:nextjs-agent-rules -->
