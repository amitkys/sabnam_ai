# AGENTS.md

Shared project context for all coding agents (Codex, Gemini, Claude, Copilot, etc.).

This file is the cross-agent source of truth. For quick reference and editor-native hints, also see `.github/copilot-instructions.md`.

## 1) Project Snapshot
- Stack: Next.js App Router (TypeScript), Prisma, PostgreSQL, TanStack Query, Zustand, Better Auth.
- Package manager: `bun` (`packageManager` in `package.json`).
- Main user flow: start test -> attempt questions (offline-aware sync) -> submit/cancel -> view result.

## 2) Important Paths
- App routes: `app/**`
- Server actions (current active): `lib/action/**`
- Server action response contract: `lib/action-response.ts`
- Error codes: `lib/error-type.ts`
- Query hooks:
  - Read: `hooks/query/get/**`
  - Write: `hooks/query/mutation/**`
- Attempt UI flow:
  - Attempt page: `app/attempt/[attemptId]/page.tsx`
  - Attempt actions: `lib/action/attempt-actions.ts`
  - Attempt fetch action: `lib/action/get-attempt-action.ts`
  - Result action: `lib/action/result.ts`
  - Background answer sync: `hooks/use-sync-answers.ts`

## 3) Action + Query Contract (Must Keep Consistent)
### Server actions
- Use `actionWrapper` and `ActionError` from `lib/action-response.ts`.
- Return `ActionResponse<T>` shape only:
  - success: `{ success: true, data: T }`
  - failure: `{ success: false, error: string, errorCode?: string }`
- Prefer object params for actions (not positional args) for easier evolution.
- For attempt-linked actions, always enforce auth + ownership (`attempt.userId === session.user.id`).

### Query hooks (TanStack)
- Query hooks (`hooks/query/get/**`) must:
  - call server action,
  - check `res.success`,
  - throw `Error(res.error)` on failure.
- Mutation hooks (`hooks/query/mutation/**`) must keep side effects in `onSuccess`/`onError`:
  - toasts,
  - navigation,
  - query invalidation.
- Keep query keys stable and pair invalidations with fetch keys.

## 4) Current Patterns to Follow
- Attempt status should use Prisma enum (`AttemptStatus`), not raw strings.
- Keep multilingual fields as JSON objects (usually `{ en, hi }`), and do not flatten this shape.
- Keep business/data logic in server actions; keep UI components thin.
- When touching auth-sensitive code, follow module-local auth flow; current codebase still has some mixed legacy auth paths.

## 5) Build / Run
- Install: `bun install`
- Dev: `bun run dev`
- Build: `bun run build`
- Start: `bun run start`
- Lint (auto-fix): `bun run lint`
- Seed DB: `bun run db:seed`

## 6) Known Repo Reality
- There are legacy or transitional paths in this repo (for example `lib/actions.ts` and mixed conventions).
- For new work, prefer current standardized action/query contract above.
- If you must touch legacy files, avoid partial rewrites; preserve behavior and migrate in focused steps.

## 7) Agent Working Rules
- Before editing, scan related action + hook + UI call sites to avoid contract drift.
- Prefer minimal, behavior-preserving changes unless a migration is explicitly requested.
- After refactors, run at least targeted type checks for touched files and report if full repo has unrelated pre-existing errors.

## 8) Do / Don't
### Do
- Do keep server actions behind a single response contract (`ActionResponse`) and surface errors via `actionWrapper`/`ActionError`.
- Do enforce authentication and ownership checks for user-scoped resources (especially `attemptId`-based actions).
- Do keep TanStack Query error handling at hook level (`throw` in query fns, side effects in mutation callbacks).
- Do invalidate the exact query keys used by readers after successful writes.
- Do use Prisma enums/constants instead of magic strings for status-like fields.
- Do preserve existing behavior when touching legacy code unless a migration is explicitly requested.
- Do update all direct call sites when action signatures change.

### Don't
- Don't return mixed action shapes like `{ error: ... }` in one place and `{ success: false, error: ... }` in another.
- Don't put fetch/mutation business logic directly inside UI components.
- Don't expose user data by querying only by resource ID without verifying owner/session.
- Don't introduce new legacy-style actions when standardized paths/patterns exist.
- Don't do broad rewrites of unrelated legacy modules in the same change.
- Don't invalidate broad/unrelated query keys when a narrow key is available.
