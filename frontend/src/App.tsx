import { useEffect, useState } from 'react';
import type { TodoItem, TodoSummary, CreateTodoInput, UpdateTodoInput, ApiError } from './types/todo';
import {
  fetchTodos,
  createTodo,
  getTodo,
  updateTodo,
  completeTodo,
  incompleteTodo,
  deleteTodo,
} from './api/todos';
import { TodoList } from './components/TodoList';
import { TodoForm } from './components/TodoForm';
import { EditForm } from './components/EditForm';
import { TodoDetail } from './components/TodoDetail';

type View = 'list' | 'detail' | 'edit';

export default function App() {
  const [todos, setTodos] = useState<TodoSummary[]>([]);
  const [activeTodo, setActiveTodo] = useState<TodoItem | null>(null);
  const [view, setView] = useState<View>('list');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadTodos() {
    setLoading(true);
    setError(null);
    try {
      setTodos(await fetchTodos());
    } catch (err) {
      setError((err as ApiError).message ?? 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadTodos(); }, []);

  async function withError(fn: () => Promise<void>) {
    try {
      setError(null);
      await fn();
    } catch (err) {
      setError((err as ApiError).message ?? 'An error occurred');
    }
  }

  async function handleCreate(input: CreateTodoInput) {
    await withError(async () => {
      await createTodo(input);
      await loadTodos();
    });
  }

  async function handleView(id: string) {
    await withError(async () => {
      setActiveTodo(await getTodo(id));
      setView('detail');
    });
  }

  async function handleEdit(id: string) {
    await withError(async () => {
      setActiveTodo(await getTodo(id));
      setView('edit');
    });
  }

  async function handleUpdate(input: UpdateTodoInput) {
    if (!activeTodo) return;
    await withError(async () => {
      const updated = await updateTodo(activeTodo.id, input);
      setActiveTodo(updated);
      setView('detail');
      await loadTodos();
    });
  }

  async function handleComplete(id: string) {
    await withError(async () => {
      await completeTodo(id);
      if (activeTodo?.id === id) setActiveTodo(await getTodo(id));
      await loadTodos();
    });
  }

  async function handleIncomplete(id: string) {
    await withError(async () => {
      await incompleteTodo(id);
      if (activeTodo?.id === id) setActiveTodo(await getTodo(id));
      await loadTodos();
    });
  }

  async function handleDelete(id: string) {
    await withError(async () => {
      await deleteTodo(id);
      setActiveTodo(null);
      setView('list');
      await loadTodos();
    });
  }

  function handleBack() {
    setView('list');
    setActiveTodo(null);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Todo App</h1>
      </header>
      <main className="app-main">
        {error && <div className="error-banner">{error}</div>}

        {view === 'list' && (
          <>
            <TodoForm onSubmit={handleCreate} />
            {loading
              ? <p className="loading">Loading…</p>
              : <TodoList
                  todos={todos}
                  onView={handleView}
                  onComplete={handleComplete}
                  onIncomplete={handleIncomplete}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
            }
          </>
        )}

        {view === 'detail' && activeTodo && (
          <TodoDetail
            todo={activeTodo}
            onEdit={() => handleEdit(activeTodo.id)}
            onComplete={handleComplete}
            onIncomplete={handleIncomplete}
            onDelete={handleDelete}
            onBack={handleBack}
          />
        )}

        {view === 'edit' && activeTodo && (
          <EditForm
            todo={activeTodo}
            onSubmit={handleUpdate}
            onCancel={handleBack}
          />
        )}
      </main>
    </div>
  );
}
