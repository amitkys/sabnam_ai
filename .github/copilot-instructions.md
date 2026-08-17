# Copilot instructions for this repository

## Build, lint, and run commands
- Install deps: `bun install`
- Dev server: `bun run dev`
- Production build: `bun run build`
- Start production server: `bun run start`
- Lint (auto-fix enabled): `bun run lint`
- Seed database: `bun run db:seed`

### Testing
- There is currently no `test` script in `package.json` and no `*.test`/`*.spec` files.
- If tests are added, include both full-suite and single-test commands in this file.

## High-level architecture
- Stack: Next.js App Router + TypeScript + Prisma (PostgreSQL).
- App shell is in `app/layout.tsx` and wires global providers in this order: theme, sidebar, progress bar, React Query, toaster.
- Main product flow is test-taking:
  - `TestPaper`/`Question`/`TestAttempt`/`StudentResponse` in `prisma/schema.prisma`.
  - Start attempt via server action `lib/action/startTest.ts`.
  - Attempt UI in `app/attempt/[attemptId]/page.tsx` with offline-first syncing via `hooks/use-sync-answers.ts`.
  - Result retrieval in `lib/action/result.ts` and rendered in `app/result/[attemptId]/page.tsx`.
- Data model supports hierarchical category trees (`Category` with `ROOT -> ... -> CHAPTER/PYQ`) and multilingual content.
- AI endpoints are in `app/api/chat/route.ts` and `app/api/gemini/route.ts`.

## Typography and Styling Conventions
- **Use Semantic Typography Classes:** This project uses a custom, responsive typography system defined in `app/typography.css`. Do **not** use raw Tailwind text size classes (like `text-xl`, `text-2xl`, etc.) or raw font weights if a semantic class fits.
- **Headings:** Use the `.text-h1` through `.text-h6` classes on your heading tags.
  - `.text-h1`: Page titles (e.g., `text-4xl` base)
  - `.text-h2`: Major sections or main headings (e.g., `text-3xl` base)
  - `.text-h3`: Subsections or cards (e.g., `text-2xl` base) - *Commonly used as the main heading in this app's pages.*
  - `.text-h4`: Smaller sub-sections.
- **Body & Paragraphs:**
  - `.text-p`: Standard body text.
  - `.text-lead`: Larger, muted text for subtitles or descriptions.
  - `.text-large`: Emphasized, semi-bold body text.
  - `.text-small`: Smaller body text.
  - `.text-muted`: Small, muted/gray text.
- **Colors & Links:** Use semantic text colors defined in the typography file (`.text-destructive-color`, `.text-warning-color`, `.text-success-color`, `.text-link`).
- **Why?** These utility classes contain built-in responsive media queries, line-heights, letter spacing, and `scroll-margin-top` for anchor links. Mixing raw Tailwind sizes breaks the responsive scaling.

## Key conventions and constraints
- Use the `@/*` import alias (`tsconfig.json`) instead of long relative paths.
- For app data operations, prefer **Server Actions** under `lib/actions/**` as the data boundary. Keep fetch/mutation logic out of UI components.
- Server Action folder pattern for new code:
  - `lib/actions/get/*` for read-only actions (query/fetch data).
  - `lib/actions/mutation/*` for create/update/delete actions.
- Existing legacy actions currently exist in `lib/actions.ts` and `lib/action/*`; when touching related code, align with existing behavior, but place new actions in the `lib/actions/get` or `lib/actions/mutation` structure.
- TanStack Query hook structure is standardized:
  - `hooks/query/get/*` for read hooks (`useQuery`) that call server actions.
  - `hooks/query/mutation/*` for create/update/delete hooks (`useMutation`) that call server actions.
- Keep pairing consistent: `hooks/query/get/*` should call `lib/actions/get/*`, and `hooks/query/mutation/*` should call `lib/actions/mutation/*`.
- In query hooks, enforce the response contract (`success`, `data`, `error`) and throw on failure so React Query handles error states consistently.
- In mutation hooks, keep side effects in `onSuccess`/`onError` (toast, navigation, invalidation) and invalidate related query keys after writes when needed.
- Multilingual content is stored as JSON objects, typically `{ en: string, hi: string }` (`lib/type.ts`, schema comments). Preserve this shape in API/server-action changes.
- In newer server actions, prefer the structured response pattern from `lib/action-response.ts` (`{ success, data|error, errorCode }`) instead of throwing raw strings.
- Attempt state is intentionally persisted in `sessionStorage` via Zustand stores (`lib/store/new-attempt-store.ts`, `lib/store/useQuizStore.ts`) to survive refresh in same tab without long-lived local persistence.
- Prisma client is generated to `lib/generated/prisma` and imported from there. Keep generated-client imports consistent.
- Auth is currently mixed across codepaths (`better-auth` in `lib/auth.ts` and legacy `GetServerSessionHere` / `next-auth` usage). When changing auth-sensitive code, follow the existing flow of that module instead of partially switching frameworks.
- `bun` is the source of truth for package management (`packageManager` in `package.json`), even though `.gemini/GEMINI.md` mentions `pnpm`.
- Lint command runs with `--fix`; expect formatting/import order changes when linting.
