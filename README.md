# Hackerrank Lite (Next.js + Prisma + Judge0)

A clean & minimal coding challenge platform — **ready to present**.

## Tech
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (minimal styles)
- Prisma ORM + PostgreSQL
- NextAuth (Google) ready (demo uses a seeded user)
- Judge0 code execution integration (mocked if no keys)

## Getting Started

1. **Install deps**
```bash
npm install
```
2. **Configure env**
Copy `.env.example` to `.env.local` and fill values:
- `DATABASE_URL` (e.g., Neon/Supabase/Postgres)
- `NEXTAUTH_SECRET` (any strong secret)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (optional)
- `RAPIDAPI_KEY` (optional for Judge0; if absent, API runs in mock mode)

3. **Prisma migrate & seed**
```bash
npx prisma db push
npm run prisma:seed
```
> This seeds two sample problems and a **Demo User** (id: `demo-user`, email: `demo@demo.local`).

4. **Run**
```bash
npm run dev
```

## Key Pages
- `/` Home
- `/dashboard` Metrics
- `/problems` List of problems
- `/problems/[slug]` Problem details
- `/solve/[slug]` Monaco editor with **Run** and **Submit** (Submit checks against stored test cases)
- `/leaderboard` Top users by solves
- `/profile` Demo profile with stats and recent submissions
- `/admin` Basic CRUD for problems (open for demo; add role guard in prod)

## Execution Modes
- **Mock mode** (no `RAPIDAPI_KEY`): Run/Submit return mock outputs so your demo never breaks.
- **Real mode**: Add a RapidAPI Judge0 key + URL to evaluate actual code. The submit endpoint runs each test case and records a PASSED/FAILED status.

## Production Notes
- Replace demo submission user fallback with `auth()` session user in `/api/execute` and `/api/submit` once NextAuth is configured.
- Add a role guard (ADMIN) for `/admin` using your session.
