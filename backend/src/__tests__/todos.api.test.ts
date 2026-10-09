import request from 'supertest';
import { createApp } from '../api/app';
import { InMemoryTodoRepository } from '../repository/InMemoryTodoRepository';
import { TodoService } from '../service/TodoService';
import { errorMiddleware } from '../api/errorMiddleware';
import { ApiError } from '../errors/ApiError';
import type { Request, Response, NextFunction } from 'express';

function buildApp() {
  const repo = new InMemoryTodoRepository();
  const service = new TodoService(repo);
  return createApp(service);
}

describe('Error middleware', () => {
  it('sends ApiError shape with correct status', () => {
    const err = ApiError.notFound('not found');
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
    errorMiddleware(err, {} as Request, res, jest.fn() as unknown as NextFunction);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ code: 'NOT_FOUND', message: 'not found', fields: {} });
  });

  it('sends 500 INTERNAL_ERROR for unknown errors', () => {
    const err = new Error('crash');
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
    errorMiddleware(err, {} as Request, res, jest.fn() as unknown as NextFunction);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      fields: {},
    });
  });
});

describe('POST /api/todos', () => {
  it('creates a todo and returns 201', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/todos').send({ title: 'Buy milk' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'Buy milk', isCompleted: false });
    expect(res.body.id).toBeDefined();
  });

  it('returns 400 for missing title', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/todos').send({ title: '' });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR', fields: { title: 'REQUIRED' } });
  });

  it('returns 400 for title exceeding 255 chars', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/todos').send({ title: 'a'.repeat(256) });
    expect(res.status).toBe(400);
    expect(res.body.fields).toMatchObject({ title: 'TOO_LONG' });
  });

  it('returns 400 for invalid dueDate format', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/todos').send({ title: 'T', dueDate: 'not-a-date' });
    expect(res.status).toBe(400);
    expect(res.body.fields).toMatchObject({ dueDate: 'INVALID_FORMAT' });
  });
});

describe('GET /api/todos', () => {
  it('returns empty array when no todos', async () => {
    const app = buildApp();
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([]);
  });

  it('returns created todos as summaries', async () => {
    const app = buildApp();
    await request(app).post('/api/todos').send({ title: 'Task 1' });
    await request(app).post('/api/todos').send({ title: 'Task 2' });
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({ title: 'Task 1' });
    expect(res.body[0].description).toBeUndefined();
  });

  it('filters by completed status', async () => {
    const app = buildApp();
    const { body: t1 } = await request(app).post('/api/todos').send({ title: 'T1' });
    await request(app).post('/api/todos').send({ title: 'T2' });
    await request(app).patch(`/api/todos/${t1.id}/complete`);
    const res = await request(app).get('/api/todos?filter=completed');
    expect(res.body).toHaveLength(1);
    expect(res.body[0].isCompleted).toBe(true);
  });

  it('sorts by title', async () => {
    const app = buildApp();
    await request(app).post('/api/todos').send({ title: 'Zebra' });
    await request(app).post('/api/todos').send({ title: 'Apple' });
    const res = await request(app).get('/api/todos?sortBy=title');
    expect(res.body[0].title).toBe('Apple');
    expect(res.body[1].title).toBe('Zebra');
  });
});

describe('GET /api/todos/:id', () => {
  it('returns full todo detail', async () => {
    const app = buildApp();
    const { body: created } = await request(app)
      .post('/api/todos')
      .send({ title: 'Detail', description: 'Full desc', dueDate: '2025-06-01' });
    const res = await request(app).get(`/api/todos/${created.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: created.id,
      title: 'Detail',
      description: 'Full desc',
      dueDate: '2025-06-01',
    });
    expect(res.body.updatedAt).toBeDefined();
  });

  it('returns 404 for unknown id', async () => {
    const app = buildApp();
    const res = await request(app).get('/api/todos/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ code: 'NOT_FOUND', fields: {} });
  });
});

describe('PUT /api/todos/:id', () => {
  it('updates a todo and returns the updated record', async () => {
    const app = buildApp();
    const { body: created } = await request(app)
      .post('/api/todos')
      .send({ title: 'Original', description: 'Keep' });
    const res = await request(app)
      .put(`/api/todos/${created.id}`)
      .send({ title: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ title: 'Updated', description: 'Keep' });
  });

  it('clears description when null is sent', async () => {
    const app = buildApp();
    const { body: created } = await request(app)
      .post('/api/todos')
      .send({ title: 'T', description: 'Will be cleared' });
    const res = await request(app)
      .put(`/api/todos/${created.id}`)
      .send({ title: 'T', description: null });
    expect(res.status).toBe(200);
    expect(res.body.description).toBeNull();
  });

  it('returns 404 for unknown id', async () => {
    const app = buildApp();
    const res = await request(app).put('/api/todos/nonexistent').send({ title: 'T' });
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid input', async () => {
    const app = buildApp();
    const { body: created } = await request(app).post('/api/todos').send({ title: 'T' });
    const res = await request(app).put(`/api/todos/${created.id}`).send({ title: '' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/todos/:id', () => {
  it('deletes a todo and returns 204', async () => {
    const app = buildApp();
    const { body: created } = await request(app).post('/api/todos').send({ title: 'Remove' });
    const res = await request(app).delete(`/api/todos/${created.id}`);
    expect(res.status).toBe(204);
    expect(await request(app).get(`/api/todos/${created.id}`).then((r) => r.status)).toBe(404);
  });

  it('returns 404 for unknown id', async () => {
    const app = buildApp();
    const res = await request(app).delete('/api/todos/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/todos/:id/complete', () => {
  it('marks a todo as completed', async () => {
    const app = buildApp();
    const { body: created } = await request(app).post('/api/todos').send({ title: 'T' });
    const res = await request(app).patch(`/api/todos/${created.id}/complete`);
    expect(res.status).toBe(200);
    expect(res.body.isCompleted).toBe(true);
  });

  it('returns 404 for unknown id', async () => {
    const app = buildApp();
    const res = await request(app).patch('/api/todos/nonexistent/complete');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/todos/:id/incomplete', () => {
  it('marks a todo as not completed', async () => {
    const app = buildApp();
    const { body: created } = await request(app).post('/api/todos').send({ title: 'T' });
    await request(app).patch(`/api/todos/${created.id}/complete`);
    const res = await request(app).patch(`/api/todos/${created.id}/incomplete`);
    expect(res.status).toBe(200);
    expect(res.body.isCompleted).toBe(false);
  });

  it('returns 404 for unknown id', async () => {
    const app = buildApp();
    const res = await request(app).patch('/api/todos/nonexistent/incomplete');
    expect(res.status).toBe(404);
  });
});
