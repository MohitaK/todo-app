import type { TodoItem, TodoSummary, CreateTodoInput, FilterStatus, SortBy } from '../domain/todo.types';

export type UpdateFields = {
  title: string;
  description: string | null;
  dueDate: string | null;
};

export interface ITodoRepository {
  create(input: CreateTodoInput): Promise<TodoItem>;
  findAll(filter?: FilterStatus, sortBy?: SortBy): Promise<TodoSummary[]>;
  findById(id: string): Promise<TodoItem | null>;
  update(id: string, fields: UpdateFields): Promise<TodoItem | null>;
  complete(id: string): Promise<TodoItem | null>;
  incomplete(id: string): Promise<TodoItem | null>;
  delete(id: string): Promise<boolean>;
}
