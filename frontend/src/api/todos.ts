import type {
  TodoItem,
  TodoSummary,
  CreateTodoInput,
  UpdateTodoInput,
  FilterStatus,
  SortBy,
  ApiError,
} from '../types/todo';

const BASE = '/api/todos';

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }
  const error: ApiError = await res.json();
  throw error;
}

export async function fetchTodos(filter?: FilterStatus, sortBy?: SortBy): Promise<TodoSummary[]> {
  const params = new URLSearchParams();
  if (filter) params.set('filter', filter);
  if (sortBy) params.set('sortBy', sortBy);
  const query = params.size > 0 ? `?${params}` : '';
  const res = await fetch(`${BASE}${query}`);
  return handleResponse<TodoSummary[]>(res);
}

export async function createTodo(input: CreateTodoInput): Promise<TodoItem> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleResponse<TodoItem>(res);
}

export async function getTodo(id: string): Promise<TodoItem> {
  const res = await fetch(`${BASE}/${id}`);
  return handleResponse<TodoItem>(res);
}

export async function updateTodo(id: string, input: UpdateTodoInput): Promise<TodoItem> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleResponse<TodoItem>(res);
}

export async function completeTodo(id: string): Promise<TodoItem> {
  const res = await fetch(`${BASE}/${id}/complete`, { method: 'PATCH' });
  return handleResponse<TodoItem>(res);
}

export async function incompleteTodo(id: string): Promise<TodoItem> {
  const res = await fetch(`${BASE}/${id}/incomplete`, { method: 'PATCH' });
  return handleResponse<TodoItem>(res);
}

export async function deleteTodo(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  return handleResponse<void>(res);
}
