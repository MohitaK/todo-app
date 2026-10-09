# History

## Step 1 — Project setup
- [x] Created project directory: `/Users/mohitakaushik/Documents/projects/todo-app`
- [x] Ran `git init` in the project root
- [x] Created `docs/specs.md` with the full take-home assignment text

## Step 3 — CI + pre-push hook (pending)
- [ ] `.github/workflows/ci.yml` — parallel backend + frontend jobs (typecheck + test + coverage thresholds)
- [ ] `.git/hooks/pre-push` — local gate: blocks push if typecheck or tests fail

## Step 4 — ADR creation (pending)
- [ ] `docs/adr.md` — single document containing all 9 ADRs

## Step 4 — Backend implementation (pending)
- [ ] Scaffold `backend/` (package.json, tsconfig.json, install deps)
- [ ] Domain layer — types + validator
- [ ] Error class
- [ ] Repository layer — interface + FileTodoRepository + InMemoryTodoRepository
- [ ] Service layer
- [ ] API layer — router, handlers, error middleware, app, server
- [ ] Backend tests

## Step 5 — Frontend implementation (pending)
- [ ] Scaffold `frontend/` with Vite + React TS template
- [ ] Configure Vite proxy `/api` → `localhost:3000`
- [ ] Types (mirrors backend domain)
- [ ] API client (fetch wrappers)
- [ ] Components — TodoList, TodoItem, TodoForm, EditForm, TodoDetail
- [ ] App.tsx — state, handlers, view routing
- [ ] Frontend tests

## Step 6 — Docs (pending)
- [ ] `README.md`

---

## Step 2 — Requirements validation
- [x] Read spec, extracted requirements checklist
- [x] Identified unclear/ambiguous points (see below)
- [x] Decided: TypeScript + SPA, UUID for IDs

---

# Decisions Made

- **Language:** TypeScript (Node.js)
- **Backend framework:** Express
- **Frontend framework:** React
- **HTTP client:** native `fetch` (no axios)
- **Frontend state:** plain `useState` + `useEffect` lifted to `App.tsx`; no Redux, Context, or React Query
- **Interface:** SPA (React frontend + REST API backend)
- **ID strategy:** UUID v4
- **Package manager:** npm
- **Frontend scaffolding:** Vite
- **Backend dev runner:** tsx
- **Ports:** backend `:3000` (Express default), frontend `:5173` (Vite default); Vite proxies `/api` → `localhost:3000`
- **Build order:** backend first (domain → repository → service → API → tests), then frontend

---

# Requirements Checklist

## Decisions Required (Choose One Each)
- [x] Language: ~~JavaScript/TypeScript (Node.js)~~ → **TypeScript**
- [x] Interface: ~~CLI | Basic Web | SPA | RESTful API~~ → **SPA + REST API**

## Data Model
- [ ] `id` — UUID v4, auto-generated on creation
- [ ] `title` — string, required
- [ ] `description` — string, optional
- [ ] `dueDate` — string, optional, YYYY-MM-DD
- [ ] `isCompleted` — boolean, default false
- [ ] `createdAt` — timestamp, auto-set on creation
- [ ] `updatedAt` — timestamp, auto-set on creation, updated on every mutation

## CRUD + Status Operations
- [ ] Add — create a new todo
- [ ] List — show all todos (title, dueDate, isCompleted visible)
- [ ] View — get one todo by ID
- [ ] Update — modify title, description, or dueDate by ID
- [ ] Complete — set isCompleted = true by ID
- [ ] Incomplete — set isCompleted = false by ID
- [ ] Delete — remove by ID

## API Endpoints (if API chosen)
- [ ] `POST /todos`
- [ ] `GET /todos`
- [ ] `GET /todos/{id}`
- [ ] `PUT /todos/{id}`
- [ ] `DELETE /todos/{id}`
- [ ] `PATCH /todos/{id}/complete` (and incomplete equivalent)
- [ ] Standard HTTP status codes
- [ ] JSON request/response bodies

## Persistence
- [ ] Data survives between runs (file-based JSON/CSV sufficient; in-memory with clear swap point also acceptable)

### Repository Design
- `ITodoRepository` — interface defining the contract (`create`, `findAll`, `findById`, `update`, `complete`, `incomplete`, `delete`)
- `FileTodoRepository` — implements the interface; reads/writes `todos.json` for runtime persistence
- `InMemoryTodoRepository` — implements the same interface; stores data in a plain array; used only in tests (no file I/O)
- Service layer depends only on `ITodoRepository` — swapping file → DB is a constructor change only

## Submission / Repo
- [ ] Clean commit history
- [ ] `README.md`: run instructions, test instructions, design choices, assumptions, optional trade-offs

## Optional Enhancements (time-permitting)
- [ ] Filter list (completed / incomplete / overdue)
- [ ] Sort list (by dueDate / createdAt / title)
- [ ] Input validation
- [ ] Docker containerization

---

# Assumptions

1. **`id` is part of the data model** — UUID v4, auto-generated, not supplied by the client.
2. **`PUT /todos/{id}` body:** `title` is required; `description` and `dueDate` are optional. Omitting an optional field preserves the existing value; sending `null` explicitly clears it.
3. **`isCompleted` is managed exclusively via `/complete` and `/incomplete` endpoints** — it cannot be set through the update (`PUT`) endpoint. This is an intentional separation of concerns.
4. **Complete/Incomplete endpoint design** — Two explicit endpoints: `PATCH /todos/{id}/complete` and `PATCH /todos/{id}/incomplete`. No request body needed; the action is implied by the URL.
5. **UI separation of concerns** — The UI exposes two distinct actions per todo: (a) edit details (title, description, dueDate) and (b) toggle complete/incomplete. These are separate interactions; the edit form does not expose `isCompleted`, and the complete/incomplete toggle does not open an edit form.

6. **Error response shape:**
   ```json
   {
     "code": "VALIDATION_ERROR | NOT_FOUND | INTERNAL_ERROR",
     "message": "Human-readable summary",
     "fields": { "fieldName": "REQUIRED | INVALID_FORMAT | INVALID_TYPE | TOO_LONG" }
   }
   ```
   `fields` is always present (empty object `{}` for non-validation errors so the client never null-checks it).
   HTTP status mapping: `VALIDATION_ERROR` → 400, `NOT_FOUND` → 404, `INTERNAL_ERROR` → 500.

7. **`updatedAt` field** — Included. Auto-set on creation, updated on every mutation (PUT, PATCH complete/incomplete).

8. **`GET /todos` response shape** — Returns a subset per item: `id`, `title`, `dueDate`, `isCompleted`, `createdAt`. `description` and `updatedAt` are omitted from the list. Full object (all fields) is returned by `GET /todos/:id`.


9. **Tests** — Unit tests only. No e2e.

---

# ADR Contents

Each ADR follows: **Status / Context / Decision / Consequences**

### 1 — Layered Architecture
- **Status:** Accepted
- **Context:** Needed a backend structure that demonstrates clear separation of concerns and is independently testable at each layer. Considered Vertical Slice and CQRS-lite.
- **Decision:** Layered architecture (Domain → Repository → Service → API).
- **Consequences:** Each layer is testable in isolation; request path is traceable; repository interface satisfies spec's "clear separation allowing for a switch to persistent storage."

### 2 — Repository Interface Pattern
- **Status:** Accepted
- **Context:** Spec requires file-based persistence but hints at the ability to swap storage. Tests must not touch the filesystem.
- **Decision:** Define `ITodoRepository` interface; implement `FileTodoRepository` for runtime and `InMemoryTodoRepository` for tests.
- **Consequences:** Service layer never imports a concrete store; swapping to a DB is a constructor change only; tests run fast with zero I/O.

### 3 — UUID v4 for IDs
- **Status:** Accepted
- **Context:** Need unique IDs for todos. Options: auto-increment integer or UUID.
- **Decision:** UUID v4 generated at creation time.
- **Consequences:** IDs are globally unique and require no coordination or DB sequence; safe to generate in the repository layer without a counter.

### 4 — Two Explicit Endpoints for Complete/Incomplete
- **Status:** Accepted
- **Context:** Spec says `PATCH /todos/{id}/complete` "or similar" with no explicit incomplete endpoint.
- **Decision:** Two endpoints: `PATCH /todos/:id/complete` and `PATCH /todos/:id/incomplete`. No request body — intent is in the URL.
- **Consequences:** No ambiguity about what the body means; each endpoint is idempotent and self-documenting.

### 5 — PUT Preserve-on-Omit Semantics
- **Status:** Accepted
- **Context:** `PUT /todos/:id` allows updating title, description, dueDate. True PUT (full replacement) would force clients to always send all fields to avoid accidental data loss.
- **Decision:** Omitting an optional field preserves the existing value; sending `null` explicitly clears it.
- **Consequences:** Safer for partial updates; clients only send what they intend to change; `null` as an intentional clear signal is explicit.

### 6 — List Returns Subset, Detail Returns Full Object
- **Status:** Accepted
- **Context:** Spec says list should show "Title, Due Date, Completion Status." Could return full objects or a subset.
- **Decision:** `GET /todos` returns `id, title, dueDate, isCompleted, createdAt` per item. `GET /todos/:id` returns the full object including `description` and `updatedAt`.
- **Consequences:** List payload is lean and matches spec intent; detail view requires a separate fetch; two distinct response shapes to maintain.

### 7 — Native fetch over Axios
- **Status:** Accepted
- **Context:** Frontend needs an HTTP client to call the API.
- **Decision:** Use native `fetch` (no axios).
- **Consequences:** Zero additional dependency; sufficient for this scope; slightly more verbose error handling but keeps the dependency tree minimal.

### 8 — Jest (Backend) + Vitest (Frontend)
- **Status:** Accepted
- **Context:** Need test runners for both backend and frontend.
- **Decision:** Jest + Supertest for the Express backend; Vitest + React Testing Library for the React frontend.
- **Consequences:** Each runner is the idiomatic default for its environment (Jest for Node, Vitest for Vite); no cross-environment config needed; slightly inconsistent tooling across the monorepo.

### 9 — Plain useState for Frontend State
- **Status:** Accepted
- **Context:** Needed a frontend state strategy. Considered React Query but it's overkill for a single-resource CRUD app with no pagination, background refetching, or cross-component cache needs.
- **Decision:** Plain `useState` + `useEffect` lifted to `App.tsx`. No Redux, Context, or React Query.
- **Consequences:** Zero extra dependencies; any developer can read the data flow without framework knowledge; loading/error state is managed manually (~50 lines); sufficient for this scope.

---

# Backend Architecture

**Pattern: Layered (Domain → Repository → Service → API)**

Chosen over Vertical Slice and CQRS-lite for the following reasons:
- The spec explicitly evaluates architecture and testability — layered makes each concern independently testable without going through HTTP
- The repository interface directly satisfies the spec's requirement: "clear separation allowing for a switch to persistent storage"
- Single domain entity (`Todo`) means vertical slice offers no navigation benefit — it would produce the same files in one folder with no added clarity
- Reviewers can trace a request from route → service → repository without cross-cutting concerns obscuring the path

---

# Frontend Architecture

**Pattern: Simple stateful App + presentational components**

All server state (todo list, loading, error) lives in `App.tsx` via `useState` + `useEffect`. Components below App are presentational — they receive data and callbacks as props.

```
App.tsx                  # owns todos[], loading, error state; fetches on mount
  ├── TodoList            # renders list or empty state
  │     └── TodoItem      # renders one row; emits onComplete, onIncomplete, onEdit, onDelete
  ├── TodoForm            # create form; emits onCreate
  ├── EditForm            # edit form; prefilled; emits onUpdate
  └── TodoDetail          # detail view; emits onEdit, onComplete, onIncomplete, onDelete
```

Chosen over React Query and Context + useReducer because:
- Single resource (todos) — no cross-component cache coordination needed
- Flat component tree — prop drilling is 1 level deep, not painful
- Zero extra dependencies — any developer can read it without framework knowledge
- Loading/error state is ~20 lines manually; not worth an abstraction at this scale

---

# Folder Structure

```
todo-app/
  backend/
    src/
      domain/          # TodoItem type, field validation rules
      repository/      # file persistence + in-memory implementation
      service/         # business logic (createTodo, updateTodo, etc.)
      api/             # Express app, routes, handlers, error middleware
      __tests__/       # all backend tests (mirrors src structure)
    package.json
    tsconfig.json

  frontend/
    src/
      api/             # fetch wrappers for each endpoint
      components/      # TodoList, TodoItem, TodoForm, EditForm, TodoDetail
      types/           # shared TS types (mirrors backend domain)
      __tests__/       # all frontend tests
    package.json
    tsconfig.json

  docs/
    specs.md
    adr.md
```

---

# Test Specification

## Tooling
- Backend: Jest + Supertest (in-memory store, no file I/O)
- Frontend: Vitest + React Testing Library

## Assertion Rules
- `toMatchObject` — API responses and repository records (contain generated fields: id, createdAt, updatedAt)
- `toStrictEqual` — pure functions and error objects where exact shape matters
- Never `toBe` for object comparisons

## Coverage
- **Repository:** CRUD operations, not-found cases
- **Service:** validation logic, business rules
- **API:** happy path + error cases per endpoint
- **Frontend:** form validation, list rendering, toggle behavior

## Validation Rules
- `title` — required, max 255 chars (`TOO_LONG` if exceeded)
- `description` — optional, max 1000 chars (`TOO_LONG` if exceeded)
- `dueDate` — optional, must match YYYY-MM-DD and be a real calendar date; past dates are allowed

---

# Implementation Plan

## Iteration 0 — CI + pre-push validation
_commit: `chore: add CI and pre-push hook`_

### `.github/workflows/ci.yml`
Triggers on push and pull_request. Two jobs run in parallel:
- **backend:** `npm ci` → `tsc --noEmit` → `npm test -- --coverage --coverageThreshold='{"global":{"statements":80,"branches":75}}'`
- **frontend:** `npm ci` → `tsc --noEmit` → `npm test -- --coverage --coverageThreshold='{"global":{"statements":70,"branches":65}}'`

### `.git/hooks/pre-push` (shell script, no husky)
Runs locally before every `git push`. Blocks push if any step fails:
```
cd backend  → tsc --noEmit → npm test
cd frontend → tsc --noEmit → npm test
```
- **Gate:** push to remote is blocked if typecheck or tests fail in either package

---

## Iteration 1 — Backend scaffolding
_commit: `chore: scaffold backend`_
- `backend/package.json`: scripts (`dev: tsx watch src/server.ts`, `build: tsc`, `test: jest`)
- Runtime deps: `express`, `uuid`, `cors`
- Dev deps: `typescript`, `tsx`, `@types/express`, `@types/node`, `@types/uuid`, `jest`, `ts-jest`, `@types/jest`, `supertest`, `@types/supertest`
- `backend/tsconfig.json`: strict mode, target ES2020, module CommonJS, outDir `dist`
- **Gate:** `tsc --noEmit` passes with zero errors

## Iteration 2 — Domain layer + Error class
_commit: `feat: add domain types, validation, and error class`_
- `domain/todo.types.ts`:
  - `TodoItem` — full record (all 8 fields)
  - `TodoSummary` — list projection (`id, title, dueDate, isCompleted, createdAt`)
  - `CreateTodoInput` — `{ title, description?, dueDate? }`
  - `UpdateTodoInput` — `{ title, description?: string | null, dueDate?: string | null }`
  - `FilterStatus` — `'completed' | 'incomplete' | 'overdue'`
  - `SortBy` — `'dueDate' | 'createdAt' | 'title'`
- `domain/todo.validator.ts`:
  - `validateCreateInput(input): void` — throws `ApiError` on failure
  - `validateUpdateInput(input): void` — throws `ApiError` on failure
- `errors/ApiError.ts`: class with `code`, `message`, `fields`, `statusCode`; static factories `validationError(fields)`, `notFound(msg)`, `internalError(msg)`
- **Gate:** `tsc --noEmit` passes; all validator exports are importable

## Iteration 3 — Repository layer
_commit: `feat: add repository layer`_
- `repository/ITodoRepository.ts`: interface — `create`, `findAll(filter?, sortBy?)`, `findById`, `update`, `complete`, `incomplete`, `delete`
- `repository/InMemoryTodoRepository.ts`: plain array, used in tests
- `repository/FileTodoRepository.ts`: reads/writes `data/todos.json`; creates file if absent
- **Gate:** `tsc --noEmit` passes; `FileTodoRepository` and `InMemoryTodoRepository` both satisfy `ITodoRepository` (TypeScript enforces this at compile time)

## Iteration 4 — Service layer
_commit: `feat: add service layer`_
- `service/TodoService.ts`: constructor `(repo: ITodoRepository)`
  - `createTodo(input)` — validates, calls `repo.create`, returns `TodoItem`
  - `getTodos(filter?, sortBy?)` — returns `TodoSummary[]`
  - `getTodoById(id)` — returns `TodoItem` or throws `NOT_FOUND`
  - `updateTodo(id, input)` — validates, updates, returns `TodoItem` or throws `NOT_FOUND`
  - `completeTodo(id)` — returns `TodoItem` or throws `NOT_FOUND`
  - `incompleteTodo(id)` — returns `TodoItem` or throws `NOT_FOUND`
  - `deleteTodo(id)` — returns void or throws `NOT_FOUND`
- **Gate:** `tsc --noEmit` passes; `TodoService` accepts `ITodoRepository` (not a concrete class)

## Iteration 5 — API layer
_commit: `feat: add API layer`_
- `api/errorMiddleware.ts`: Express error handler — catches `ApiError`, sends `{ code, message, fields }` with correct status
- `api/todos.router.ts`: all 7 routes wired to inline handlers; each handler calls `TodoService` and returns JSON
- `api/app.ts`: Express app, mounts `express.json()`, `/api/todos` router, error middleware; exports `app` (for Supertest)
- `api/server.ts`: creates `FileTodoRepository` + `TodoService`, injects into app, listens on `:3000`
- **Gate:** `npm run dev` starts without errors; `curl http://localhost:3000/api/todos` returns `[]`

## Iteration 6 — Backend tests
_commit: `test: add backend tests`_
- `__tests__/validators.test.ts` — pure function tests, all valid + invalid cases
- `__tests__/repository.test.ts` — uses `InMemoryTodoRepository`, CRUD + filter + sort + not-found
- `__tests__/service.test.ts` — mocks `ITodoRepository`, validates delegation + error throwing
- `__tests__/todos.api.test.ts` — Supertest against `app` wired with `InMemoryTodoRepository`; happy path + error cases per endpoint
- **Gate:** `npm test` passes with 0 failures; coverage: statements ≥ 80%, branches ≥ 75%

## Iteration 7 — Frontend scaffolding
_commit: `chore: scaffold frontend`_
- `npm create vite@latest frontend -- --template react-ts`
- Add to `vite.config.ts`: proxy `{ '/api': 'http://localhost:3000' }`
- Dev deps: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`
- Vitest config: `environment: 'jsdom'`
- **Gate:** `npm run dev` starts on `:5173`; `tsc --noEmit` passes

## Iteration 8 — Frontend types + API client
_commit: `feat: add frontend types and API client`_
- `types/todo.ts`: mirror `TodoItem`, `TodoSummary`, `CreateTodoInput`, `UpdateTodoInput` from backend domain
- `api/todos.ts`: one function per endpoint using native `fetch`; all functions throw parsed `ApiError` shape on non-2xx
  - `fetchTodos(filter?, sortBy?)`, `createTodo(input)`, `getTodo(id)`, `updateTodo(id, input)`, `completeTodo(id)`, `incompleteTodo(id)`, `deleteTodo(id)`
- **Gate:** `tsc --noEmit` passes; no `any` types in `api/todos.ts`

## Iteration 9 — UI components + App
_commit: `feat: add UI components`_
- `components/TodoList.tsx` — renders list or "No todos" empty state
- `components/TodoItem.tsx` — title, dueDate, status badge, Complete/Incomplete toggle, Edit, Delete
- `components/TodoForm.tsx` — create form: title (required), description, dueDate; inline validation on submit
- `components/EditForm.tsx` — prefilled from `TodoItem`; clearing field sends `null`
- `components/TodoDetail.tsx` — all fields; Edit + Complete/Incomplete + Delete actions
- `App.tsx`: state (`todos`, `loading`, `error`, `selectedId`, `view`), `useEffect` fetch on mount, all handlers, view routing
- **Gate:** `tsc --noEmit` passes; all 7 CRUD flows work manually in the browser (create, list, view, update, complete, incomplete, delete)

## Iteration 10 — Frontend tests
_commit: `test: add frontend tests`_
- `__tests__/api.test.ts` — fetch mocked; one test per function
- `__tests__/TodoList.test.tsx` — empty state, renders N items
- `__tests__/TodoItem.test.tsx` — renders fields, button visibility, callback invocation
- `__tests__/TodoForm.test.tsx` — submit valid, empty title blocked, cancel
- `__tests__/EditForm.test.tsx` — prefill, submit, clear fields, cancel
- `__tests__/TodoDetail.test.tsx` — renders all fields, absent field fallback
- **Gate:** `npm test` passes with 0 failures; coverage: statements ≥ 70%, branches ≥ 65%

## Iteration 11 — Docs
_commit: `docs: add README and ADRs`_
- `docs/adr.md` — all 9 ADRs (content already in plan)
- `README.md` — run instructions, test instructions, design choices, assumptions, trade-offs
- **Gate:** README has all 5 required sections from spec; `docs/adr.md` has all 9 ADRs
