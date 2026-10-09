import type { TodoItem, TodoSummary, FilterStatus, SortBy } from '../domain/todo.types';

export function toSummary(item: TodoItem): TodoSummary {
  return {
    id: item.id,
    title: item.title,
    dueDate: item.dueDate,
    isCompleted: item.isCompleted,
    createdAt: item.createdAt,
  };
}

export function applyFilterAndSort(
  items: TodoItem[],
  filter?: FilterStatus,
  sortBy?: SortBy,
): TodoSummary[] {
  const today = new Date().toISOString().split('T')[0];

  let filtered = items;
  if (filter === 'completed') {
    filtered = items.filter((t) => t.isCompleted);
  } else if (filter === 'incomplete') {
    filtered = items.filter((t) => !t.isCompleted);
  } else if (filter === 'overdue') {
    filtered = items.filter(
      (t) => !t.isCompleted && t.dueDate !== null && t.dueDate < today,
    );
  }

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'dueDate') {
      if (a.dueDate === null && b.dueDate === null) return 0;
      if (a.dueDate === null) return 1;
      if (b.dueDate === null) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    // default: createdAt
    return a.createdAt.localeCompare(b.createdAt);
  });

  return sorted.map(toSummary);
}
