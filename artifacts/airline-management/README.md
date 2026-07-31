# SkyAir Operations — Airline Management System

A full-featured airline operations dashboard built with React, Vite, TypeScript, and Supabase.

## Features

- **Flight Management** — Create, edit, update, and cancel flights with real-time status
- **Employee Management** — Full CRUD, suspend, promote, transfer employees
- **Analytics** — Delay trends, route performance, aircraft utilization, financial overview
- **Real-time Notifications** — Live Supabase Realtime notifications for flight/crew/HR events
- **Authentication** — Supabase Auth with sign-in, registration, and password reset
- **Role-Based Access Control** — Admin, Manager, Pilot, Crew, Staff roles via Row Level Security
- **Dark Mode** — Full light/dark mode support
- **Responsive** — Works on desktop and tablet

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, TailwindCSS, shadcn/ui, Recharts
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + RLS)
- **Routing**: Wouter
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Deployment**: Vercel (static)

---

## Setup

### 1. Supabase Database

Run the SQL migrations in order in your Supabase SQL Editor:

1. `supabase/migrations/001_initial_schema.sql` — All tables, indexes, triggers
2. `supabase/migrations/002_rls_policies.sql` — Row Level Security policies
3. `supabase/migrations/003_seed_data.sql` — Sample data (roles, departments, aircraft, routes, flights, employees)

### 2. Supabase Auth

In your Supabase Dashboard:
- Go to **Authentication → Providers** and enable Email provider
- Under **Authentication → URL Configuration**, set:
  - **Site URL**: Your production domain (e.g. `https://your-app.vercel.app`)
  - **Redirect URLs**: Add `https://your-app.vercel.app/reset-password`
- Optionally disable email confirmation for testing under **Authentication → Settings**

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role |
| `VITE_ADMIN_EMAIL` | Your admin's email address |

### 4. Set Admin Role

After signing up with your admin email, run this in the Supabase SQL Editor:

```sql
UPDATE profiles
SET role_id = (SELECT id FROM roles WHERE name = 'super_admin')
WHERE email = 'your-admin@email.com';
```

### 5. Local Development

```bash
# From the workspace root
pnpm --filter @workspace/airline-management run dev
```

The app runs at `http://localhost:<PORT>`.

---

## Deploying to Vercel

### Option A — Vercel CLI

```bash
cd artifacts/airline-management

# Install Vercel CLI if needed
npm i -g vercel

# Build first
pnpm run build

# Deploy
vercel --prod
```

### Option B — Vercel Dashboard (recommended)

1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. Set the **Root Directory** to `artifacts/airline-management`
5. Set **Framework Preset** to **Vite**
6. Add all environment variables from `.env.example` under **Environment Variables**
7. Click **Deploy**

> The `vercel.json` file in this directory handles SPA routing (all paths → `index.html`).

### Build Command (auto-detected by Vercel)

```bash
pnpm run build
```

**Output directory**: `dist/public`

> Note: Update Vercel's output directory setting to `dist/public` if it defaults to `dist`.

---

## Project Structure

```
src/
  components/
    layout/          # AppLayout, Sidebar, Header
    shared/          # ProtectedRoute, StatusBadge, EmptyState, ConfirmDialog
    ui/              # shadcn/ui components
  contexts/
    AuthContext.tsx  # Auth state provider
  hooks/
    useAuth.ts       # Session + profile management
    useFlights.ts    # Flights CRUD + realtime
    useEmployees.ts  # Employees CRUD
    useNotifications.ts  # Realtime notifications
    useAnalytics.ts  # Dashboard stats + trends
  lib/
    supabase.ts      # Supabase client
    auth.ts          # Auth helpers (signIn, signUp, resetPassword)
  pages/
    auth/            # Login (sign in + register + forgot password)
    dashboard/       # Main ops dashboard
    flights/         # Flight list + create form
    employees/       # Employee directory
    analytics/       # Charts & analytics
    notifications/   # Notification center
    settings/        # Profile, security, preferences
  types/
    supabase.ts      # Full TypeScript database types
supabase/
  migrations/        # SQL migration scripts
vercel.json          # Vercel SPA routing config
.env.example         # Environment variable template
```

---

## Role Permissions

| Role | Flights | Employees | Analytics | Admin |
|---|---|---|---|---|
| `super_admin` | Full | Full | Full | Full |
| `admin` | Full | Full | Full | Limited |
| `manager` | CRUD | CRUD | View | — |
| `pilot` | View | — | — | — |
| `crew` | View | — | — | — |
| `staff` | — | Own data | — | — |
