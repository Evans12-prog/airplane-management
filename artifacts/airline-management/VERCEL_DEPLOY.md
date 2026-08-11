# Vercel deploy instructions — airline-management

Quick copyable settings to deploy this app to Vercel.

1) Project settings

- Project Root: `artifacts/airline-management`
- Install Command: `pnpm install`
- Build Command: `pnpm build`
- Output Directory: `dist/public`
- Node Version: set to `>=20.18.0` (use Node 20.x on Vercel)

2) Environment variables (set in Vercel for both Preview & Production)

- `VITE_SUPABASE_URL` — your Supabase URL (starts with `https://...supabase.co`)
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key
- Optional: `BASE_PATH` — if you host under a subpath (defaults to `/`)

Notes

- This frontend expects Supabase as the data backend. Ensure the Vercel domain is allowed as an origin in your Supabase project's CORS / allowed origins settings.
- The repo is a monorepo; set the Vercel Project Root to the `artifacts/airline-management` folder so the build runs in the correct context.
- `vite.config.ts` writes the production build to `dist/public` which is what `vercel.json` points to.
- If you use any server-side APIs that live in `api-server/` they must be deployed separately or rewritten as Vercel Serverless Functions.

3) Test locally (quick)

```bash
cd artifacts/airline-management
pnpm install
pnpm build
pnpm serve   # runs `vite preview` per package.json
```

4) Troubleshooting

- Build fails with pnpm errors: ensure Vercel is configured to use pnpm (Vercel auto-detects pnpm when `pnpm-lock.yaml` is present) and Node 20.
- Missing env vars: the app will fall back to placeholder Supabase values and appear non-functional. Double-check `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are set in Vercel.
- If realtime or websockets fail, check Supabase Realtime settings and allowed origins for the project.

If you want, I can add a short note in `vercel.json` or update the repo README to point to this file.
