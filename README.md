# Todo App

A full-stack Todo List application built with TypeScript, Express, and React.

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

## Design Choices

### Backend Architecture — Layered (Domain → Repository → Service → API)

Each layer has a single responsibility and is independently testable:

- **Domain** (`src/domain/`) — TypeScript types and input validators. No dependencies on other layers.
- **Repository** (`src/repository/`) — `ITodoRepository` interface with two implementations: `FileTodoRepository` (runtime, writes `data/todos.json`) and `InMemoryTodoRepository` (tests, zero I/O).
- **Service** (`src/service/`) — Business logic. Depends only on `ITodoRepository`, never on a concrete store. Swapping file storage for a database is a constructor-injection change only.
- **API** (`src/api/`) — Express router and error middleware. `createApp(service)` exports the configured app so Supertest can import it without starting a real server.

### Testing Strategy

**Backend:** Jest + Supertest. All tests use `InMemoryTodoRepository` — no filesystem access, no server ports. Four suites cover validators (pure functions), the repository (CRUD, filter, sort), the service (mocked repo, delegation and NOT_FOUND propagation), and the API (HTTP round-trips via Supertest).

**Frontend:** Vitest + React Testing Library. The API module is mocked with `vi.mock`; components are tested in isolation via props and callbacks; `App.tsx` is tested end-to-end by mocking the API and simulating user interactions.

### Frontend State

All server state lives in `App.tsx` via plain `useState` + `useEffect`. No Redux, Context, or React Query — the flat component tree (one level of prop passing) and single resource (todos) make these abstractions unnecessary.

---

## Assumptions

1. **`id` is server-generated** — UUID v4, not supplied by the client.
2. **`PUT /todos/:id` preserve-on-omit semantics** — omitting an optional field keeps the existing value; sending `null` explicitly clears it.
3. **`isCompleted` is managed exclusively via `/complete` and `/incomplete`** — the update endpoint does not accept `isCompleted`.
4. **Two explicit PATCH endpoints** — `PATCH /todos/:id/complete` and `PATCH /todos/:id/incomplete`; no request body needed.
5. **`GET /todos` returns a subset** — `id, title, dueDate, isCompleted, createdAt`. Full object (including `description`, `updatedAt`) is returned by `GET /todos/:id`.
6. **`updatedAt` is included** — auto-set on creation and updated on every mutation.
7. **Error response shape** — `{ code, message, fields }` where `fields` is always present (empty object `{}` for non-validation errors).
8. **Unit tests only** — no end-to-end tests.
9. **Past due dates are allowed** — `dueDate` must be a valid calendar date in YYYY-MM-DD format; no future-date constraint.

---

## Trade-offs

- **File I/O is not atomic** — `FileTodoRepository` does read-then-write without a lock. Concurrent requests could lose writes. Acceptable for a single-process demo; a database or write queue would be required in production.
- **No pagination** — `GET /todos` returns all records. Sufficient for a take-home scope; would need cursor or offset pagination at scale.
- **Frontend has no optimistic updates** — every mutation reloads the full list from the server. Keeps the state model simple at the cost of an extra round-trip per action.
