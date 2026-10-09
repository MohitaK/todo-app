import { ApiError } from '../errors/ApiError';
import type { TodoItem, TodoSummary, CreateTodoInput, UpdateTodoInput, FilterStatus, SortBy } from '../domain/todo.types';
import { validateCreateInput, validateUpdateInput } from '../domain/todo.validator';
import type { ITodoRepository } from '../repository/ITodoRepository';

export class TodoService {
  constructor(private readonly repo: ITodoRepository) {}

  async createTodo(input: CreateTodoInput): Promise<TodoItem> {
    validateCreateInput(input);
    return this.repo.create(input);
  }

  async getTodos(filter?: FilterStatus, sortBy?: SortBy): Promise<TodoSummary[]> {
    return this.repo.findAll(filter, sortBy);
  }

  async getTodoById(id: string): Promise<TodoItem> {
    const item = await this.repo.findById(id);
    if (!item) throw ApiError.notFound(`Todo with id '${id}' not found`);
    return item;
  }

  async updateTodo(id: string, input: UpdateTodoInput): Promise<TodoItem> {
    validateUpdateInput(input);
    const existing = await this.repo.findById(id);
    if (!existing) throw ApiError.notFound(`Todo with id '${id}' not found`);

    // preserve-on-omit: undefined keeps existing value; null explicitly clears it
    const description = input.description === undefined ? existing.description : input.description;
    const dueDate = input.dueDate === undefined ? existing.dueDate : input.dueDate;

    const updated = await this.repo.update(id, { title: input.title, description, dueDate });
    if (!updated) throw ApiError.notFound(`Todo with id '${id}' not found`);
    return updated;
  }

  async completeTodo(id: string): Promise<TodoItem> {
    const item = await this.repo.complete(id);
    if (!item) throw ApiError.notFound(`Todo with id '${id}' not found`);
    return item;
  }

  async incompleteTodo(id: string): Promise<TodoItem> {
    const item = await this.repo.incomplete(id);
    if (!item) throw ApiError.notFound(`Todo with id '${id}' not found`);
    return item;
  }

  async deleteTodo(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) throw ApiError.notFound(`Todo with id '${id}' not found`);
  }
}
