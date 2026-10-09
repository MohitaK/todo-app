# Todo App

A full-stack Todo List application built with TypeScript, Express, and React.

---

## Features

- Create, view, edit, and delete todos
- Mark todos complete or incomplete
- Filter by status: All, Incomplete, Completed, Overdue
- Sort by: Date Added, Due Date, Title
- Status badge (Pending / Overdue / Completed) on list and detail views
- Data persists between runs via `data/todos.json`

---

## Running the Application

**Prerequisites:** Node.js 20+, npm

### Backend

```bash
cd backend
npm install
npm run dev        # starts on http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # starts on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/api` requests to the backend automatically.

### Production build

```bash
cd backend && npm run build   # compiles to backend/dist/
cd frontend && npm run build  # compiles to frontend/dist/
```

---

## Running the Tests

### Backend (Jest + Supertest)

```bash
cd backend
npm test                        # run tests
npm test -- --coverage          # run with coverage report
```

Coverage thresholds: statements ≥ 80%, branches ≥ 75%.

### Frontend (Vitest + React Testing Library)

```bash
cd frontend
npm test                        # run tests
npm test -- --coverage          # run with coverage report
```

Coverage thresholds: statements ≥ 70%, branches ≥ 65%.

---

## Development Approach

**Plan before code** — Before writing any code, I read the spec in full, extracted a requirements checklist, flagged ambiguous points, and produced a concrete build order — all documented in [`docs/plan.md`](docs/plan.md). Architectural decisions (language, framework, ID strategy, API design, repository pattern) are recorded in [`docs/adr.md`](docs/adr.md), with the original assignment preserved in [`docs/specs.md`](docs/specs.md).

**Iterative, gate-driven implementation** — Built layer by layer: backend first (domain → repository → service → API → tests), then frontend (types → API client → components → App → tests). Each iteration ended with `tsc --noEmit` and a full test run before moving to the next.

**Review and harden** — After the full implementation was working, I reviewed all layers for duplicate code, low-value tests, and correctness gaps. Changes were applied one at a time with individual commits: refactors (shared validator helper, unified repository methods, stale closure fix), then UI improvements (overdue badge, input constraints), then backend hardening (date range validation, non-string title guard).

---

## Project Structure

```
todo-app/
├── backend/
│   └── src/
│       ├── domain/        # TypeScript types and input validators
│       ├── repository/    # ITodoRepository interface + FileTodoRepository + InMemoryTodoRepository
│       ├── service/       # Business logic
│       ├── api/           # Express router, error middleware, app factory
│       └── __tests__/     # Validators, repository, service, and API integration tests
├── frontend/
│   └── src/
│       ├── api/           # fetch wrappers for each endpoint
│       ├── components/    # TodoList, TodoItem, TodoForm, EditForm, TodoDetail
│       ├── types/         # TypeScript types mirroring the backend domain
│       └── __tests__/     # Component and API client tests
└── docs/
    ├── specs.md           # Original assignment
    └── adr.md             # Architectural Decision Records
```

---

## Design Choices

### Backend Architecture — Layered (Domain → Repository → Service → API)

Each layer has a single responsibility and is independently testable:

- **Domain** (`src/domain/`) — TypeScript types and input validators. No dependencies on other layers.
- **Repository** (`src/repository/`) — `ITodoRepository` interface with two implementations: `FileTodoRepository` (runtime, writes `data/todos.json`) and `InMemoryTodoRepository` (tests, zero I/O).
- **Service** (`src/service/`) — Business logic. Depends only on `ITodoRepository`, never on a concrete store. Swapping file storage for a database is a constructor-injection change only.
- **API** (`src/api/`) — Express router and error middleware. `createApp(service)` exports the configured app so Supertest can import it without starting a real server.

### Testing Strategy

**Backend:** Jest + Supertest. All tests use `InMemoryTodoRepository` — no filesystem access, no server ports. The key insight is that the service layer depends only on the repository interface, so each layer can be tested in isolation without wiring up the full stack.

**Frontend:** Vitest + React Testing Library. The API module is mocked with `vi.mock`; components are tested in isolation via props and callbacks.

### Frontend State

All server state lives in `App.tsx` via plain `useState` + `useEffect`. No Redux, Context, or React Query — the flat component tree (one level of prop passing) and single resource (todos) make these abstractions unnecessary.

---

## API Reference

All endpoints are prefixed with `/api/todos`. Request and response bodies are JSON.

| Method | Path | Request Body | Response |
|--------|------|-------------|----------|
| `POST` | `/api/todos` | `{ title, description?, dueDate? }` | `TodoItem` · 201 |
| `GET` | `/api/todos` | — | `TodoSummary[]` · 200 |
| `GET` | `/api/todos/:id` | — | `TodoItem` · 200 |
| `PUT` | `/api/todos/:id` | `{ title, description?, dueDate? }` | `TodoItem` · 200 |
| `DELETE` | `/api/todos/:id` | — | 204 |
| `PATCH` | `/api/todos/:id/complete` | — | `TodoItem` · 200 |
| `PATCH` | `/api/todos/:id/incomplete` | — | `TodoItem` · 200 |

**`GET /api/todos` query parameters:**

| Param | Values |
|-------|--------|
| `filter` | `completed` · `incomplete` · `overdue` |
| `sortBy` | `dueDate` · `title` · `createdAt` |

**`TodoSummary`** (list): `id, title, dueDate, isCompleted, createdAt`

**`TodoItem`** (detail): all fields above plus `description` and `updatedAt`

**Error shape:** `{ code, message, fields }` — `code` is one of `VALIDATION_ERROR` (400), `NOT_FOUND` (404), `INTERNAL_ERROR` (500). `fields` is always present (empty object for non-validation errors).

---

## Assumptions

1. **`id` is server-generated** — UUID v4, not supplied by the client.
2. **`PUT /todos/:id` preserve-on-omit semantics** — omitting an optional field keeps the existing value; sending `null` explicitly clears it.
3. **`isCompleted` is managed exclusively via `/complete` and `/incomplete`** — the update endpoint does not accept `isCompleted`.
4. **Two explicit PATCH endpoints** — `PATCH /todos/:id/complete` and `PATCH /todos/:id/incomplete`; no request body needed.
5. **`GET /todos` returns a subset** — `id, title, dueDate, isCompleted, createdAt`. Full object (including `description`, `updatedAt`) is returned by `GET /todos/:id`.
6. **`updatedAt` is included** — auto-set on creation and updated on every mutation.

---

## Trade-offs

- **File I/O is not atomic** — `FileTodoRepository` does read-then-write without a lock. Concurrent requests could lose writes. Acceptable for a single-process demo; a database or write queue would be required in production.
- **No pagination** — `GET /todos` returns all records. Sufficient for a take-home scope; would need cursor or offset pagination at scale.
