import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  fetchTodos,
  createTodo,
  getTodo,
  updateTodo,
  completeTodo,
  incompleteTodo,
  deleteTodo,
} from '../api/todos';

const fetchSpy = vi.spyOn(globalThis, 'fetch');

function mockFetch(status: number, body: unknown) {
  fetchSpy.mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

beforeEach(() => fetchSpy.mockReset());

describe('fetchTodos', () => {
  it('calls GET /api/todos and returns the array', async () => {
    mockFetch(200, [{ id: '1', title: 'T' }]);
    const result = await fetchTodos();
    expect(fetchSpy).toHaveBeenCalledWith('/api/todos');
    expect(result).toEqual([{ id: '1', title: 'T' }]);
  });

  it('appends filter and sortBy as query params', async () => {
    mockFetch(200, []);
    await fetchTodos('completed', 'title');
    expect(fetchSpy).toHaveBeenCalledWith('/api/todos?filter=completed&sortBy=title');
  });

  it('throws the parsed error body on non-2xx', async () => {
    mockFetch(404, { code: 'NOT_FOUND', message: 'not found', fields: {} });
    await expect(fetchTodos()).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

describe('createTodo', () => {
  it('calls POST /api/todos with JSON body', async () => {
    mockFetch(201, { id: '1', title: 'T' });
    await createTodo({ title: 'T' });
    expect(fetchSpy).toHaveBeenCalledWith('/api/todos', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ title: 'T' }),
    }));
  });

  it('throws on 400', async () => {
    mockFetch(400, { code: 'VALIDATION_ERROR', message: 'bad', fields: { title: 'REQUIRED' } });
    await expect(createTodo({ title: '' })).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});

describe('getTodo', () => {
  it('calls GET /api/todos/:id', async () => {
    mockFetch(200, { id: 'abc' });
    await getTodo('abc');
    expect(fetchSpy).toHaveBeenCalledWith('/api/todos/abc');
  });
});

describe('updateTodo', () => {
  it('calls PUT /api/todos/:id with JSON body', async () => {
    mockFetch(200, { id: 'abc' });
    await updateTodo('abc', { title: 'New' });
    expect(fetchSpy).toHaveBeenCalledWith('/api/todos/abc', expect.objectContaining({ method: 'PUT' }));
  });
});

describe('completeTodo', () => {
  it('calls PATCH /api/todos/:id/complete', async () => {
    mockFetch(200, { id: 'abc', isCompleted: true });
    await completeTodo('abc');
    expect(fetchSpy).toHaveBeenCalledWith('/api/todos/abc/complete', { method: 'PATCH' });
  });
});

describe('incompleteTodo', () => {
  it('calls PATCH /api/todos/:id/incomplete', async () => {
    mockFetch(200, { id: 'abc', isCompleted: false });
    await incompleteTodo('abc');
    expect(fetchSpy).toHaveBeenCalledWith('/api/todos/abc/incomplete', { method: 'PATCH' });
  });
});

describe('deleteTodo', () => {
  it('calls DELETE /api/todos/:id and returns undefined on 204', async () => {
    mockFetch(204, undefined);
    const result = await deleteTodo('abc');
    expect(fetchSpy).toHaveBeenCalledWith('/api/todos/abc', { method: 'DELETE' });
    expect(result).toBeUndefined();
  });
});
