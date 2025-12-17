# Copilot Instructions for CodeLab

## Architecture Overview

**CodeLab** is a competitive coding platform built with Next.js 14 (App Router), TypeScript, Prisma, and Judge0. The system separates concerns into three layers:

- **Frontend**: React components with server/client boundary (marked with `"use client"`)
- **API Routes**: Next.js Route Handlers in `/app/api/` that orchestrate business logic
- **Data Layer**: Prisma ORM with PostgreSQL (`/prisma/schema.prisma`)

### Critical Data Flows

1. **Code Execution (Run)**: `SolveClient.tsx` → `/api/execute` → Judge0 API → mock fallback
2. **Code Submission (Submit)**: `SolveClient.tsx` → `/api/submit` → Judge0 (test all cases) → XP reward system
3. **User Progression**: Problem solved → `addXp()` in `lib/levels.ts` → User leveling

## Key Architectural Patterns

### Server/Client Boundaries

- **Pages** are Server Components by default; only add `"use client"` to components with interactivity
- Examples: `ProblemsClient.tsx`, `SolveClient.tsx` use client-side state + API calls
- **Exception**: `/app/api/*` routes are always server-side (no `"use client"`)

### Judge0 Integration

- Supported languages: Python (71), C++ (54), Java (62), C (50) — mapped in `LANG_MAP`
- **Two execution modes**:
  - **Real mode** (env: `JUDGE0_API_URL`, `RAPIDAPI_KEY`): Calls live Judge0 CE API
  - **Mock mode** (no keys): Both `/api/execute` and `/api/submit` return hardcoded success responses
- Language templates in `SolveClient.tsx` use clean defaults (e.g., Python has comments guiding input/output)

### Authentication & Authorization

- **NextAuth.js** configured in `lib/auth.ts` with Google provider + JWT strategy
- **Fallback to demo**: `userId` is nullable in submissions if user isn't logged in (see `/api/submit`)
- **TODO in production**: Add role guards (`ADMIN` enum exists but unused) to `/admin` pages

### XP & Leveling System

- `rewardForDifficulty()` returns 10 XP (EASY), 20 (MEDIUM), 40 (HARD)
- `addXp()` increments level when total XP crosses threshold (`LEVEL_STEP = 100`)
- Applied on successful submission in `/api/submit`

### Paginated Client-Side Filtering

- `ProblemsClient.tsx` pattern: keeps full `problems[]` array in state, filters locally (not via API)
- Pagination: `PAGE_SIZE = 25`, computed page numbers with ellipsis ("...")
- Reset to page 1 on filter change (prevents out-of-bounds navigation)

## Specific Conventions & Gotchas

### Input Handling in Judge0

- **Empty stdin causes crashes** (Java Scanner hangs). Fix: `/api/execute` replaces empty input with `"0"`
- Code assumes test cases have properly formatted input; malformed input will fail silently

### Database: Nullable userId

- `Submission.userId` is **optional** (`String?`) to support anonymous demo submissions
- Check both `WHERE { userId: null }` and real user IDs when querying submissions

### Routing Conventions

- Dynamic segments: `/problems/[slug]/page.tsx` and `/solve/[slug]/page.tsx` both use slug
- Admin CRUD at `/admin` (new, edit, delete) — currently unguarded; add role checks before production

### Component File Naming

- Server pages: `page.tsx`
- Client interactivity layers: `*Client.tsx` (e.g., `ProblemsClient.tsx`, `SolveClient.tsx`)
- Shared components: PascalCase in `/components/` (e.g., `UserMenu.tsx`, `ThemeToggle.tsx`)

### Types & Validation

- **TypeScript is strict** (`strict: true` in tsconfig.json)
- Zod imported but minimal usage; consider adding schema validation to API POST bodies
- Problem data shape: `{ id, title, slug, difficulty, description, examples, tags, testCases[] }`

## Development Workflow

```bash
# Install & setup
npm install
npx prisma db push
npm run prisma:seed

# Run dev server
npm run dev

# Rebuild database (reset seed)
npx prisma db push
npm run prisma:seed
```

**Seed data**: Two sample problems + "Demo User" (id: `demo-user`, email: `demo@demo.local`) for demo mode.

## Testing & Debugging Tips

1. **No API keys set?** App runs in mock mode — all executions return mocked output
2. **Judge0 errors?** Check `console.log("EXECUTE ERROR:", ...)` in `/api/execute` for raw response
3. **User not persisting after submit?** Verify NextAuth session setup in `lib/auth.ts` callbacks (token.id → session.user.id)
4. **Page shows wrong total pages?** Debug in `ProblemsClient.tsx` — useEffect on `totalPages` should reset pagination

## File Touchpoints for Common Changes

| Task                       | Files                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| Add a new problem field    | `schema.prisma`, seed.ts, `SolveClient.tsx` (problem data), problem details page          |
| Change XP/leveling         | `lib/levels.ts`, `/api/submit` (call site)                                                |
| Add language support       | `LANG_MAP` in `/api/execute` and `/api/submit`, `DEFAULT_CODE` in `SolveClient.tsx`       |
| Add role-based access      | `lib/auth.ts` (extend session), API routes (check `session.user.role`), `/admin/page.tsx` |
| Modify leaderboard ranking | `/app/leaderboard/page.tsx` query logic, consider indexing in schema                      |
