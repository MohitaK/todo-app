# Take-Home Assignment: To-Do List Application

## Scenario

Build a To-Do List Application that allows users to manage their tasks.

---

## Core Requirements

### Programming Language

Please implement the solution in one of the following:

- JavaScript/TypeScript (Node.js)
- Python
- C#
- Java

### Interface (Choose One)

Select the primary way a user interacts with your application:

- **Command-Line Interface (CLI):** Accept commands and arguments to perform actions.
- **Basic Web Interface:** Implement simple web pages/forms (minimal frontend JS/styling is fine) to interact with the backend logic. Focus on functionality over visual polish. Frameworks like NextJS, Flask/Django, ASP.NET Core MVC/Razor Pages or any other frameworks are acceptable.
- **SPA:** Implement a solution using React, Vue, Angular, and or any other modern SPA framework.
- **RESTful API:** Design API endpoints (preferably returning JSON) that allow clients to manage to-do items.

> **Important Note:** Regardless of your choice, the primary evaluation focus remains on the architecture, testing, and code quality, not the sophistication or polish of the interface itself.

### Data Model

Each to-do item must include:

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | Required. A short description of the task. |
| `description` | string | Optional. A longer explanation. |
| `dueDate` | string | Optional. YYYY-MM-DD format. |
| `isCompleted` | boolean | Defaults to `false`. |
| `createdAt` | timestamp | When the item was created. |

### Functionality (CRUD + Status)

Provide capabilities to perform the following actions through your chosen interface:

- **Add:** Create a new to-do item.
- **List:** Display all to-do items (include essential details like Title, Due Date, Completion Status).
- **View:** Show details of a specific to-do item by its ID.
- **Update:** Modify the title, description, or due date of an existing item by its ID.
- **Complete:** Mark a specific to-do item as completed by its ID.
- **Incomplete:** Mark a specific to-do item as not completed by its ID.
- **Delete:** Remove a to-do item by its ID.

### API Specifics (If Chosen)

Define clear endpoints using standard REST conventions:

- `POST /todos` — Create
- `GET /todos` — List all
- `GET /todos/{id}` — View one
- `PUT /todos/{id}` — Update
- `DELETE /todos/{id}` — Delete
- `PATCH /todos/{id}/complete` or similar — Complete/Incomplete

Use standard HTTP methods and status codes. JSON request/response bodies are preferred.

### Persistence

Data should persist between application runs. A simple file-based storage (e.g., JSON, CSV) is sufficient. A full database is not required. An in-memory store with clear separation allowing for a switch to persistent storage is also acceptable if file I/O pushes you significantly over the time estimate.

---

## Optional Enhancements (If Time Permits)

- Filtering the list (e.g., show only completed, incomplete, or overdue items)
- Sorting the list (e.g., by due date, creation date, title)
- Input validation (important for APIs/Web UIs)
- Containerize the application (e.g., using Docker)

---

## Submission

- Provide a link to a Git repository (e.g., GitHub, GitLab).
- Include a `README.md` file in the root of the repository with:
  - Clear instructions on how to build/run the application.
  - Instructions on how to run the tests.
  - A brief explanation of your design choices, particularly regarding backend architecture and testing strategy.
  - Any assumptions you made.
  - *(Optional)* Notes on any trade-offs made due to the time constraint.
- Ensure your commit history is reasonably clean, reflecting your development process.
