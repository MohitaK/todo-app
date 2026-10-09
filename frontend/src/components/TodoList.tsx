import type { TodoSummary } from '../types/todo';
import { TodoItem } from './TodoItem';

interface Props {
  todos: TodoSummary[];
  onView: (id: string) => void;
  onComplete: (id: string) => void;
  onIncomplete: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoList({ todos, onView, onComplete, onIncomplete, onEdit, onDelete }: Props) {
  if (todos.length === 0) {
    return <p className="empty-state">No todos yet. Add one above.</p>;
  }
  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onView={onView}
          onComplete={onComplete}
          onIncomplete={onIncomplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
