# Architecture Decision Records

Each ADR follows: **Status / Context / Decision / Consequences**

---

## 1 — Layered Architecture

- **Status:** Accepted
- **Context:** Needed a backend structure that demonstrates clear separation of concerns and is independently testable at each layer. Considered Vertical Slice and CQRS-lite.
- **Decision:** Layered architecture (Domain → Repository → Service → API).
- **Consequences:** Each layer is testable in isolation; request path is traceable; repository interface satisfies spec's "clear separation allowing for a switch to persistent storage."

---

## 2 — Repository Interface Pattern

- **Status:** Accepted
- **Context:** Spec requires file-based persistence but hints at the ability to swap storage. Tests must not touch the filesystem.
- **Decision:** Define `ITodoRepository` interface; implement `FileTodoRepository` for runtime and `InMemoryTodoRepository` for tests.
- **Consequences:** Service layer never imports a concrete store; swapping to a DB is a constructor change only; tests run fast with zero I/O.

---

## 3 — UUID v4 for IDs

- **Status:** Accepted
- **Context:** Need unique IDs for todos. Options: auto-increment integer or UUID.
- **Decision:** UUID v4 generated at creation time.
- **Consequences:** IDs are globally unique and require no coordination or DB sequence; safe to generate in the repository layer without a counter.

---

## 4 — Two Explicit Endpoints for Complete/Incomplete

- **Status:** Accepted
- **Context:** Spec says `PATCH /todos/{id}/complete` "or similar" with no explicit incomplete endpoint.
- **Decision:** Two endpoints: `PATCH /todos/:id/complete` and `PATCH /todos/:id/incomplete`. No request body — intent is in the URL.
- **Consequences:** No ambiguity about what the body means; each endpoint is idempotent and self-documenting.

---

## 5 — PUT Preserve-on-Omit Semantics

- **Status:** Accepted
- **Context:** `PUT /todos/:id` allows updating title, description, dueDate. True PUT (full replacement) would force clients to always send all fields to avoid accidental data loss.
- **Decision:** Omitting an optional field preserves the existing value; sending `null` explicitly clears it.
- **Consequences:** Safer for partial updates; clients only send what they intend to change; `null` as an intentional clear signal is explicit.

---

## 6 — List Returns Subset, Detail Returns Full Object

- **Status:** Accepted
- **Context:** Spec says list should show "Title, Due Date, Completion Status." Could return full objects or a subset.
- **Decision:** `GET /todos` returns `id, title, dueDate, isCompleted, createdAt` per item. `GET /todos/:id` returns the full object including `description` and `updatedAt`.
- **Consequences:** List payload is lean and matches spec intent; detail view requires a separate fetch; two distinct response shapes to maintain.

---

## 7 — Native fetch over Axios

- **Status:** Accepted
- **Context:** Frontend needs an HTTP client to call the API.
- **Decision:** Use native `fetch` (no axios).
- **Consequences:** Zero additional dependency; sufficient for this scope; slightly more verbose error handling but keeps the dependency tree minimal.

---

## 8 — Jest (Backend) + Vitest (Frontend)

- **Status:** Accepted
- **Context:** Need test runners for both backend and frontend.
- **Decision:** Jest + Supertest for the Express backend; Vitest + React Testing Library for the React frontend.
- **Consequences:** Each runner is the idiomatic default for its environment (Jest for Node, Vitest for Vite); no cross-environment config needed; slightly inconsistent tooling across the monorepo.

---

## 9 — Plain useState for Frontend State

- **Status:** Accepted
- **Context:** Needed a frontend state strategy. Considered React Query but it's overkill for a single-resource CRUD app with no pagination, background refetching, or cross-component cache needs.
- **Decision:** Plain `useState` + `useEffect` lifted to `App.tsx`. No Redux, Context, or React Query.
- **Consequences:** Zero extra dependencies; any developer can read the data flow without framework knowledge; loading/error state is managed manually (~50 lines); sufficient for this scope.
