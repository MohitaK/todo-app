import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { TodoItem, TodoSummary, CreateTodoInput, FilterStatus, SortBy } from '../domain/todo.types';
import type { ITodoRepository, UpdateFields } from './ITodoRepository';
import { applyFilterAndSort } from './helpers';

export class FileTodoRepository implements ITodoRepository {
  private readonly filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath ?? path.join(process.cwd(), 'data', 'todos.json');
  }

  private async readAll(): Promise<TodoItem[]> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(raw) as TodoItem[];
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw err;
    }
  }

  private async writeAll(items: TodoItem[]): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(items, null, 2), 'utf-8');
  }

  async create(input: CreateTodoInput): Promise<TodoItem> {
    const items = await this.readAll();
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
    items.push(item);
    await this.writeAll(items);
    return item;
  }

  async findAll(filter?: FilterStatus, sortBy?: SortBy): Promise<TodoSummary[]> {
    const items = await this.readAll();
    return applyFilterAndSort(items, filter, sortBy);
  }

  async findById(id: string): Promise<TodoItem | null> {
    const items = await this.readAll();
    return items.find((t) => t.id === id) ?? null;
  }

  async update(id: string, fields: UpdateFields): Promise<TodoItem | null> {
    const items = await this.readAll();
    const idx = items.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...fields, updatedAt: new Date().toISOString() };
    await this.writeAll(items);
    return items[idx];
  }

  async setCompleted(id: string, value: boolean): Promise<TodoItem | null> {
    const items = await this.readAll();
    const idx = items.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], isCompleted: value, updatedAt: new Date().toISOString() };
    await this.writeAll(items);
    return items[idx];
  }

  async delete(id: string): Promise<boolean> {
    const items = await this.readAll();
    const idx = items.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    items.splice(idx, 1);
    await this.writeAll(items);
    return true;
  }
}
