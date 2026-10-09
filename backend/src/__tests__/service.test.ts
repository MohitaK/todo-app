import { TodoService } from '../service/TodoService';
import { ApiError } from '../errors/ApiError';
import type { ITodoRepository } from '../repository/ITodoRepository';
import type { TodoItem } from '../domain/todo.types';

const makeTodo = (overrides: Partial<TodoItem> = {}): TodoItem => ({
  id: 'uuid-1',
  title: 'Test',
  description: null,
  dueDate: null,
  isCompleted: false,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

function buildMockRepo(): jest.Mocked<ITodoRepository> {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    setCompleted: jest.fn(),
    delete: jest.fn(),
  };
}

describe('TodoService', () => {
  let repo: jest.Mocked<ITodoRepository>;
  let service: TodoService;

  beforeEach(() => {
    repo = buildMockRepo();
    service = new TodoService(repo);
  });

  describe('createTodo', () => {
    it('validates input, then delegates to repo.create', async () => {
      const todo = makeTodo();
      repo.create.mockResolvedValue(todo);
      const result = await service.createTodo({ title: 'Test' });
      expect(repo.create).toHaveBeenCalledWith({ title: 'Test' });
      expect(result).toStrictEqual(todo);
    });

    it('throws validation error without calling repo for invalid input', async () => {
      await expect(service.createTodo({ title: '' })).rejects.toBeInstanceOf(ApiError);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('getTodoById', () => {
    it('returns the todo when found', async () => {
      const todo = makeTodo();
      repo.findById.mockResolvedValue(todo);
      const result = await service.getTodoById('uuid-1');
      expect(result).toStrictEqual(todo);
    });

    it('throws NOT_FOUND when repo returns null', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.getTodoById('missing')).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('updateTodo', () => {
    it('validates, fetches existing, then calls repo.update with resolved fields', async () => {
      const existing = makeTodo({ description: 'Old desc', dueDate: '2025-01-01' });
      const updated = makeTodo({ title: 'New', description: 'Old desc', dueDate: null });
      repo.findById.mockResolvedValue(existing);
      repo.update.mockResolvedValue(updated);

      // description omitted → preserve; dueDate: null → clear
      await service.updateTodo('uuid-1', { title: 'New', dueDate: null });

      expect(repo.update).toHaveBeenCalledWith('uuid-1', {
        title: 'New',
        description: 'Old desc',
        dueDate: null,
      });
    });

    it('preserves both optional fields when both are omitted', async () => {
      const existing = makeTodo({ description: 'Keep', dueDate: '2025-06-01' });
      repo.findById.mockResolvedValue(existing);
      repo.update.mockResolvedValue(existing);

      await service.updateTodo('uuid-1', { title: 'Same' });

      expect(repo.update).toHaveBeenCalledWith('uuid-1', {
        title: 'Same',
        description: 'Keep',
        dueDate: '2025-06-01',
      });
    });

    it('throws validation error without calling repo for invalid input', async () => {
      await expect(service.updateTodo('uuid-1', { title: '' })).rejects.toBeInstanceOf(ApiError);
      expect(repo.findById).not.toHaveBeenCalled();
    });

    it('throws NOT_FOUND when findById returns null', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.updateTodo('missing', { title: 'T' })).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  describe('completeTodo', () => {
    it('delegates to repo.setCompleted(true) and returns the result', async () => {
      const todo = makeTodo({ isCompleted: true });
      repo.setCompleted.mockResolvedValue(todo);
      const result = await service.completeTodo('uuid-1');
      expect(repo.setCompleted).toHaveBeenCalledWith('uuid-1', true);
      expect(result.isCompleted).toBe(true);
    });

    it('throws NOT_FOUND when repo returns null', async () => {
      repo.setCompleted.mockResolvedValue(null);
      await expect(service.completeTodo('missing')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });
  });

  describe('incompleteTodo', () => {
    it('delegates to repo.setCompleted(false) and returns the result', async () => {
      const todo = makeTodo({ isCompleted: false });
      repo.setCompleted.mockResolvedValue(todo);
      const result = await service.incompleteTodo('uuid-1');
      expect(repo.setCompleted).toHaveBeenCalledWith('uuid-1', false);
      expect(result.isCompleted).toBe(false);
    });

    it('throws NOT_FOUND when repo returns null', async () => {
      repo.setCompleted.mockResolvedValue(null);
      await expect(service.incompleteTodo('missing')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });
  });

  describe('deleteTodo', () => {
    it('delegates to repo.delete and returns void', async () => {
      repo.delete.mockResolvedValue(true);
      await expect(service.deleteTodo('uuid-1')).resolves.toBeUndefined();
    });

    it('throws NOT_FOUND when repo returns false', async () => {
      repo.delete.mockResolvedValue(false);
      await expect(service.deleteTodo('missing')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });
  });
});
