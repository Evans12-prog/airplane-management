---
name: Airline Management Supabase Setup
description: Key decisions and gotchas for the SkyAir airline management system
---

**Why:** User explicitly requested Supabase (not Replit DB) and Vercel hosting. App is a pure React+Vite frontend connecting directly to Supabase — no Express API server used for data operations.

**How to apply:**
- Supabase client lives in `artifacts/airline-management/src/lib/supabase.ts` — single instance with storageKey `skyair-auth-token` to avoid duplicate GoTrueClient warning.
- SQL migrations: run `001_initial_schema.sql`, `002_rls_policies.sql`, `003_seed_data.sql` in Supabase SQL Editor in order.
- Admin role must be set manually after first sign-up: `UPDATE profiles SET role_id = (SELECT id FROM roles WHERE name = 'super_admin') WHERE email = 'admin@email.com';`
- Vercel deployment: root directory = `artifacts/airline-management`, output dir = `dist/public`, all VITE_ env vars must be set in Vercel dashboard.
- `vercel.json` handles SPA routing (all paths → index.html).
- Login page has Sign In + Register tabs — no pre-filled admin email.
