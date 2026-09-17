# MyTracker API — Backend

Fastify + TypeScript + Supabase (Auth + PostgreSQL).

## Quick start

1. Copy env:
   ```sh
   cp .env.example .env
   # fill SUPABASE_URL / ANON_KEY / SERVICE_ROLE_KEY when Supabase project exists
   # leave blank to run in mock mode (demo@mytracker.local / 123456)
   ```

2. Install:
   ```sh
   npm install
   ```

3. Run DB (when Supabase configured):
   ```sh
   # Apply migrations in Supabase SQL editor: src/db/migrations/001_init.sql
   # Then seed: src/db/seeds/001_seed.sql
   # Or via helper (requires exec_sql rpc)
   npm run db:migrate
   npm run db:seed
   ```

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
