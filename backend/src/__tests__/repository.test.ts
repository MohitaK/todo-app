import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { InMemoryTodoRepository } from '../repository/InMemoryTodoRepository';
import { FileTodoRepository } from '../repository/FileTodoRepository';

describe('InMemoryTodoRepository', () => {
  let repo: InMemoryTodoRepository;

  beforeEach(() => {
    repo = new InMemoryTodoRepository();
  });

  describe('create', () => {
    it('assigns a UUID, timestamps, and defaults', async () => {
      const item = await repo.create({ title: 'Test' });
      expect(item).toMatchObject({
        title: 'Test',
        description: null,
        dueDate: null,
        isCompleted: false,
      });
      expect(item.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      expect(item.createdAt).toBeDefined();
      expect(item.updatedAt).toBe(item.createdAt);
    });

    it('stores optional fields when provided', async () => {
      const item = await repo.create({ title: 'T', description: 'Desc', dueDate: '2025-01-01' });
      expect(item.description).toBe('Desc');
      expect(item.dueDate).toBe('2025-01-01');
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      await repo.create({ title: 'B Task', dueDate: '2025-06-01' });
      await repo.create({ title: 'A Task', dueDate: '2025-01-01' });
      await repo.create({ title: 'C Task' });
    });

    it('returns all todos as summaries with correct fields', async () => {
      const todos = await repo.findAll();
      expect(todos).toHaveLength(3);
      expect(Object.keys(todos[0]!)).toStrictEqual(['id', 'title', 'dueDate', 'isCompleted', 'createdAt']);
    });

    it('filters completed todos', async () => {
      const [first] = await repo.findAll();
      await repo.complete(first!.id);
      const todos = await repo.findAll('completed');
      expect(todos).toHaveLength(1);
      expect(todos[0]!.isCompleted).toBe(true);
    });

    it('filters incomplete todos', async () => {
      const [first] = await repo.findAll();
      await repo.complete(first!.id);
      const todos = await repo.findAll('incomplete');
      expect(todos).toHaveLength(2);
      todos.forEach((t: { isCompleted: boolean }) => expect(t.isCompleted).toBe(false));
    });

    it('filters overdue todos (past dueDate, not completed)', async () => {
      await repo.create({ title: 'Overdue', dueDate: '2000-01-01' });
      const todos = await repo.findAll('overdue');
      expect(todos.length).toBeGreaterThan(0);
      todos.forEach((t: { isCompleted: boolean; dueDate: string | null }) => {
        expect(t.isCompleted).toBe(false);
        expect(t.dueDate).not.toBeNull();
      });
    });

    it('does not include completed todos in overdue filter', async () => {
      const created = await repo.create({ title: 'Done overdue', dueDate: '2000-01-01' });
      await repo.complete(created.id);
      const todos = await repo.findAll('overdue');
      expect(todos.find((t: { id: string }) => t.id === created.id)).toBeUndefined();
    });

    it('sorts by title alphabetically', async () => {
      const todos = await repo.findAll(undefined, 'title');
      expect(todos.map((t: { title: string }) => t.title)).toStrictEqual(['A Task', 'B Task', 'C Task']);
    });

    it('sorts by dueDate with nulls last', async () => {
      const todos = await repo.findAll(undefined, 'dueDate');
      expect(todos[0]!.dueDate).toBe('2025-01-01');
      expect(todos[1]!.dueDate).toBe('2025-06-01');
      expect(todos[2]!.dueDate).toBeNull();
    });

    it('sorts by createdAt ascending', async () => {
      const todos = await repo.findAll(undefined, 'createdAt');
      expect(todos[0]!.title).toBe('B Task');
    });
  });

  describe('findById', () => {
    it('returns the matching todo', async () => {
      const created = await repo.create({ title: 'Find me' });
      const found = await repo.findById(created.id);
      expect(found).toMatchObject({ id: created.id, title: 'Find me' });
    });

    it('returns null for unknown id', async () => {
      expect(await repo.findById('nonexistent')).toBeNull();
    });
  });

  describe('update', () => {
    it('updates fields and sets a new updatedAt', async () => {
      const created = await repo.create({ title: 'Old', description: 'Desc' });
      const updated = await repo.update(created.id, { title: 'New', description: null, dueDate: '2025-03-01' });
      expect(updated).toMatchObject({ title: 'New', description: null, dueDate: '2025-03-01' });
      expect(updated!.id).toBe(created.id);
      expect(updated!.createdAt).toBe(created.createdAt);
    });

    it('returns null for unknown id', async () => {
      expect(await repo.update('nonexistent', { title: 'X', description: null, dueDate: null })).toBeNull();
    });
  });

  describe('complete', () => {
    it('sets isCompleted to true and updates updatedAt', async () => {
      const created = await repo.create({ title: 'Task' });
      const result = await repo.complete(created.id);
      expect(result!.isCompleted).toBe(true);
    });

    it('returns null for unknown id', async () => {
      expect(await repo.complete('nonexistent')).toBeNull();
    });
  });

  describe('incomplete', () => {
    it('sets isCompleted to false', async () => {
      const created = await repo.create({ title: 'Task' });
      await repo.complete(created.id);
      const result = await repo.incomplete(created.id);
      expect(result!.isCompleted).toBe(false);
    });

    it('returns null for unknown id', async () => {
      expect(await repo.incomplete('nonexistent')).toBeNull();
    });
  });

  describe('delete', () => {
    it('removes the todo and returns true', async () => {
      const created = await repo.create({ title: 'Remove me' });
      expect(await repo.delete(created.id)).toBe(true);
      expect(await repo.findById(created.id)).toBeNull();
    });

    it('returns false for unknown id', async () => {
      expect(await repo.delete('nonexistent')).toBe(false);
    });
  });
});

describe('FileTodoRepository', () => {
  let repo: FileTodoRepository;
  let tempFile: string;

  beforeEach(() => {
    tempFile = path.join(os.tmpdir(), `todos-test-${Date.now()}-${Math.random()}.json`);
    repo = new FileTodoRepository(tempFile);
  });

  afterEach(async () => {
    await fs.unlink(tempFile).catch(() => {});
  });

  it('handles missing file on first create (ENOENT branch)', async () => {
    const item = await repo.create({ title: 'First' });
    expect(item).toMatchObject({ title: 'First', isCompleted: false });
  });

  it('persists across multiple calls', async () => {
    const created = await repo.create({ title: 'Persist' });
    const found = await repo.findById(created.id);
    expect(found).toMatchObject({ id: created.id, title: 'Persist' });
  });

  it('completes a todo and persists', async () => {
    const item = await repo.create({ title: 'Task' });
    const completed = await repo.complete(item.id);
    expect(completed!.isCompleted).toBe(true);
    expect(await repo.findById(item.id)).toMatchObject({ isCompleted: true });
  });

  it('deletes a todo from the file', async () => {
    const item = await repo.create({ title: 'Delete me' });
    await repo.delete(item.id);
    expect(await repo.findById(item.id)).toBeNull();
  });

  it('returns null for unknown id on update', async () => {
    expect(await repo.update('nonexistent', { title: 'X', description: null, dueDate: null })).toBeNull();
  });

  it('returns null for unknown id on incomplete', async () => {
    expect(await repo.incomplete('nonexistent')).toBeNull();
  });
});
