export interface TodoItem {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TodoSummary {
  id: string;
  title: string;
  dueDate: string | null;
  isCompleted: boolean;
  createdAt: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  dueDate?: string;
}

export interface UpdateTodoInput {
  title: string;
  description?: string | null;
  dueDate?: string | null;
}

export type FilterStatus = 'completed' | 'incomplete' | 'overdue';
export type SortBy = 'dueDate' | 'createdAt' | 'title';

export interface ApiError {
  code: string;
  message: string;
  fields: Record<string, string>;
}
