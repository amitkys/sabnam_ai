# AGENTS.md

Shared project context for all coding agents (Codex, Gemini, Claude, Copilot, etc.).

This file is the cross-agent source of truth. For quick reference and editor-native hints, also see `.github/copilot-instructions.md`.

## 1) Project Snapshot
- Stack: Next.js App Router (TypeScript), Prisma, PostgreSQL, TanStack Query, Zustand, Better Auth.
- Package manager: `bun` (`packageManager` in `package.json`).
- Main user flow: start test -> attempt questions (offline-aware sync) -> submit/cancel -> view result.

## 2) Important Paths
- App routes: `app/**`
- Admin routes: `app/(admin)/admin/**` (`/admin`, `/admin/tests/create`, `/admin/tests/[id]`)
- Server actions (current active): `lib/action/**`
  - Admin Category actions: `lib/action/admin/category-actions.ts`
  - Admin Test actions: `lib/action/admin/test-paper-actions.ts`
  - Admin Test Series Builder: `lib/action/admin/test-series-builder-actions.ts`
  - Admin Auth: `lib/admin-auth.ts`, `lib/action/admin/admin-auth-actions.ts`
- Question parser & normalizer: `lib/question-parser.ts`
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

## 9) Category Hierarchy & Exam Folders (Folder / Subfolder Tree)
The category tree is a self-referencing hierarchy modeled by the `Category` Prisma model.

### Category Levels (`CategoryLevel` enum)
- `ROOT`: Top-level exam organization or board (e.g., *Bihar Board (BSEB)*, *CBSE*, *JEE Main*, *SSC CGL*).
- `EXAM`: Specific exam name (optional intermediary if needed).
- `STANDARD`: Class/Grade level (e.g., *Class 10*, *Class 12*).
- `SUBJECT`: Subject within a standard (e.g., *Mathematics*, *Physics*, *Science*).
- `CHAPTER`: Chapter/Topic within a subject (e.g., *Trigonometry*, *Real Numbers & Algebra*).
- `PYQ`: Previous Year Questions category.

### Top-Level Domains (`ExamDomain` enum, only on `ROOT`)
- Values: `BOARD`, `ENTRANCE`, `COMPETITIVE`, `OLYMPIAD`, `LANGUAGE`, `UNIVERSITY`, `RECRUITMENT`, `SCHOLARSHIP`, `VOCATIONAL`.

### Creating Folder Hierarchy
```ts
// 1. Root Category
const root = await prisma.category.create({
  data: { name: "Bihar Board (BSEB)", slug: "bseb", level: "ROOT", domain: "BOARD" }
});
// 2. Subfolder: Standard
const standard = await prisma.category.create({
  data: { name: "Class 10", slug: "class-10", level: "STANDARD", parentId: root.id }
});
// 3. Subfolder: Subject
const subject = await prisma.category.create({
  data: { name: "Mathematics", slug: "mathematics", level: "SUBJECT", parentId: standard.id }
});
// 4. Subfolder: Chapter
const chapter = await prisma.category.create({
  data: { name: "Trigonometry", slug: "trigonometry", level: "CHAPTER", parentId: subject.id }
});
```

### UI Routing & Display
- Root listing: `app/home/page.tsx` (groups `ROOT` categories by `domain` via `groupByDomain`).
- Drill-down: `app/home/[id]/[slug]/page.tsx` renders subfolders via `ChildrenGrid` (`app/home/[id]/[slug]/_components/children-grid.tsx`) and tests via `TestList`.

### Cascade Deletion & Question Preservation Rules
- Deleting a category folder cascades recursively to all subcategories in its subtree.
- All `TestPaper`s in the deleted subtree are removed (along with test attempts and test-question links).
- **Questions Rule**: Questions linked *exclusively* to the deleted subtree are deleted. Questions *shared* with test papers outside the deleted subtree are **preserved** and re-assigned to a surviving parent/root category.

---

## 10) Question Bank & Test Series Architecture

### Data Models
- `Category`: Folder or topic node containing tests and questions.
- `Question`: Question bank item storing bilingual content (`content: { en, hi }`), solution explanation (`solution: { en, hi }`), options (`options: [...]`), `type` (`MCQ_SINGLE`, `MCQ_MULTIPLE`, `INTEGER`, `NUMERICAL`), `difficulty` (`EASY`, `MEDIUM`, `HARD`), `correctValue`.
- `TestPaper`: Test paper metadata (`title`, `slug`, `description`, `languages`, `duration` in minutes, `totalMarks`, `isPublished`, `categoryId`).
- `TestQuestion`: Join table linking `TestPaper` and `Question` (`positiveMarks`, `negativeMarks`, `orderIndex`).

### Creating Questions & Test Series
```ts
// 1. Create Question
const question = await prisma.question.create({
  data: {
    content: { en: "##### What is $\\sin(90^\\circ)$?", hi: "##### $\\sin(90^\\circ)$ का मान क्या है?" },
    type: "MCQ_SINGLE",
    difficulty: "EASY",
    categoryId: chapter.id,
    options: [
      { id: "A", text: { en: "0", hi: "0" }, isCorrect: false },
      { id: "B", text: { en: "1", hi: "1" }, isCorrect: true },
      { id: "C", text: { en: "-1", hi: "-1" }, isCorrect: false },
      { id: "D", text: { en: "$\\infty$", hi: "$\\infty$" }, isCorrect: false },
    ],
    correctValue: "B",
    solution: { en: "$\\sin(90^\\circ) = 1$", hi: "$\\sin(90^\\circ) = 1$" },
  }
});

// 2. Create Test Paper
const testPaper = await prisma.testPaper.create({
  data: {
    title: "Class 10 Math Mock Test 1",
    slug: "class-10-math-mock-1",
    languages: ["en", "hi"],
    duration: 180, // minutes
    totalMarks: 100,
    isPublished: true,
    categoryId: subject.id,
  }
});

// 3. Link Question to Test Paper
await prisma.testQuestion.create({
  data: {
    testPaperId: testPaper.id,
    questionId: question.id,
    positiveMarks: 1.0,
    negativeMarks: 0.0,
    orderIndex: 1,
  }
});
```

---

## 11) Markdown & LaTeX Guidelines & Rendering

### Syntax & Formatting Rules
- **H5 Prefix (`#####`)**: All question content strings must begin with `#####` prefix for consistent font sizing.
- **Math / LaTeX Expressions**:
  - Enclose math expressions in `$...$` (inline) or `$$...$$` (block/display).
  - Use `\\dfrac{...}{...}` for clear fractions.
  - In JSON payloads, backslashes must be double-escaped (e.g. `"$\\sqrt{2}$"`, `"\\dfrac{a}{b}"`, `"\\text{...}"`).
- **Block Elements & Spacing**: Add `\n` before and after code blocks, tables, images, and blockquotes.
- **Multi-language format**: Multi-lingual text stored as JSON objects `{ "en": "...", "hi": "..." }`.

### Markdown Renderer Component (`components/newMarkdownRender.tsx`)
- Centralized renderer: `MarkdownRenderer`
- Libraries: `react-markdown` (v10), `remark-math` + `rehype-katex` (with `katex/dist/katex.min.css`), `remark-gfm`, `react-syntax-highlighter` (Prism), and `SafeMarkdownImage` (Next.js Image).
- **Variants (`MarkdownVariant`)**:
  - `"question"`: For test attempt question body (`QuestionsCard.tsx`).
  - `"option"`: Compact inline rendering for radio options without block margins.
  - `"analysis"`: For review & explanations (`analysis/QuestionCard.tsx`, `explain-drawer.tsx`).
  - `"default"`: Full Markdown rendering with all blocks enabled.

---

## 12) Admin Authentication & Session Management

### Overview
Admin authentication protects the `/admin` dashboard, category hierarchy tree, test series builder, and all administrative server actions without requiring complex OAuth for the management portal.

### Configuration (`.env`)
- `ADMIN_USERNAME`: Admin login username (default: `admin`).
- `ADMIN_PASSWORD`: Admin login password (default: `admin123`).
- `BETTER_AUTH_SECRET`: Secret key used for HMAC-SHA256 session token signatures.

### Architecture & Files
- **Auth Library**: `lib/admin-auth.ts`
  - `verifyAdminCredentials(username, password)`: Validates credentials against environment variables.
  - `createAdminSession(username)`: Generates an HMAC-SHA256 signed session token and sets an `httpOnly` cookie.
  - `isAdminAuthenticated()`: Reads and verifies the cookie's signature and expiration.
  - `destroyAdminSession()`: Clears the session cookie on logout.
- **Server Actions**: `lib/action/admin/admin-auth-actions.ts`
  - `adminLoginAction({ username, password })`
  - `adminLogoutAction()`
  - `checkAdminAuthAction()`
- **UI Components**:
  - `app/(admin)/admin/page.tsx`: Server component checking `isAdminAuthenticated()`. Renders `<AdminLoginForm />` if unauthenticated, or `<AdminDashboard />` if authenticated.
  - `app/(admin)/admin/_components/admin-login-form.tsx`: Client login form with loading state and error handling.

### Session Token & Cookie Contract
- **Cookie Name**: `sabnam_admin_token`
- **Security Flags**: `httpOnly: true`, `sameSite: "lax"`, `path: "/"`, `secure: process.env.NODE_ENV === "production"`.
- **Duration**: 7 days (`SESSION_MAX_AGE = 60 * 60 * 24 * 7`).
- **Token Format**: `${username}:${expiresAt_timestamp}:${hmac_sha256_signature}`
  - Signature is computed as `crypto.createHmac("sha256", SECRET).update(`${username}:${expiresAt}`).digest("hex")`.
  - Tamper-proof: If a client alters the username or expiration, the HMAC signature mismatch will immediately reject the session.

### Server Action Protection Pattern
All admin server actions must verify admin session before executing mutations:
```ts
const isAuth = await isAdminAuthenticated();
if (!isAuth) {
  throw new ActionError("Admin authorization required", ErrorTypes.UNAUTHORIZED);
}
```


