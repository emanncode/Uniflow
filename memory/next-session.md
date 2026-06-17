# Next Session

Last Completed

- Department-scoped timetable on web (removed sidebar link)
- Avatar upload for mobile profiles (needs `avatars` Supabase bucket — run `uniflow-app/supabase/avatars_storage.sql`)
- Session-end workflow: build web + app, fix errors, commit and push

Next Task

- Confirm avatar upload works after `avatars` bucket is created in Supabase

Important Reminder

- Before ending any chat: `uniflow-web` `npm run build` + `uniflow-app` `npx tsc --noEmit`, then commit and push