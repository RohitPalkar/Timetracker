# MyTracker API — Backend

Fastify + TypeScript + Supabase (Auth + PostgreSQL).

**Canonical DB migrations are in `supabase/migrations/`** (Supabase CLI). `backend/src/db/` only contains the runtime Supabase client; it does not own schema.

## Quick start

1. Copy env:
   ```sh
   cp backend/.env.example backend/.env  # if exists, else create from root .env.example
   # fill SUPABASE_URL / PUBLISHABLE_KEY / SECRET_KEY (or legacy ANON/SERVICE) 
   # leave blank to run in mock mode (demo@mytracker.local / 123456)
   ```
   New Supabase projects use `SUPABASE_PUBLISHABLE_KEY` (browser) and `SUPABASE_SECRET_KEY` (server). Legacy `SUPABASE_ANON_KEY`/`SERVICE_ROLE_KEY` still work but are deprecated 2026.

2. Install:
   ```sh
   cd backend && npm install
   ```

3. Supabase CLI (canonical):
   ```sh
   supabase init       # creates supabase/config.toml
   supabase login      # browser
   supabase link --project-ref <REF>  # from Dashboard URL
   supabase migration list   # verify
   supabase db push --dry-run
   supabase db push
   ```

   Migrations live in `supabase/migrations/` and seed in `supabase/seed.sql`.

4. Start API:
   ```sh
   npm run dev   # -> http://localhost:3001/health
   ```

5. Frontend integration:
   ```sh
   # In FE root:
   echo "VITE_API_BASE_URL=http://localhost:3001" > .env.local
   npm run dev   # -> http://localhost:5175
   ```

## Endpoints

- GET /health
- POST /api/v1/auth/request-otp {email}
- POST /api/v1/auth/verify-otp {email, code} -> {access_token}
- GET /api/v1/auth/me (Bearer)
- POST /api/v1/auth/logout
- GET /api/v1/dashboard (Bearer)

## Mock mode

When Supabase vars absent and DEMO_AUTH_FALLBACK=true, OTP 123456 is accepted for demo@mytracker.local and both /auth/me and /dashboard return deterministic Acme Technologies / super_admin data. Set DEMO_AUTH_FALLBACK=false to disable.
