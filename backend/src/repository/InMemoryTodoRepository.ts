import { v4 as uuidv4 } from 'uuid';
import type { TodoItem, TodoSummary, CreateTodoInput, FilterStatus, SortBy } from '../domain/todo.types';
import type { ITodoRepository, UpdateFields } from './ITodoRepository';
import { applyFilterAndSort } from './helpers';

export class InMemoryTodoRepository implements ITodoRepository {
  private items: TodoItem[] = [];

  async create(input: CreateTodoInput): Promise<TodoItem> {
    const now = new Date().toISOString();
    const item: TodoItem = {
      id: uuidv4(),
      title: input.title,
      description: input.description ?? null,
      dueDate: input.dueDate ?? null,
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
    };
    this.items.push(item);
    return item;
  }

  async findAll(filter?: FilterStatus, sortBy?: SortBy): Promise<TodoSummary[]> {
    return applyFilterAndSort(this.items, filter, sortBy);
  }

  async findById(id: string): Promise<TodoItem | null> {
    return this.items.find((t) => t.id === id) ?? null;
  }

  async update(id: string, fields: UpdateFields): Promise<TodoItem | null> {
    const idx = this.items.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.items[idx] = {
      ...this.items[idx],
      ...fields,
      updatedAt: new Date().toISOString(),
    };
    return this.items[idx];
  }

  async setCompleted(id: string, value: boolean): Promise<TodoItem | null> {
    const idx = this.items.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.items[idx] = {
      ...this.items[idx],
      isCompleted: value,
      updatedAt: new Date().toISOString(),
    };
    return this.items[idx];
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.items.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    this.items.splice(idx, 1);
    return true;
  }
}
