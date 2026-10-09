import type { TodoSummary } from '../types/todo';

interface Props {
  todo: TodoSummary;
  onView: (id: string) => void;
  onComplete: (id: string) => void;
  onIncomplete: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const today = new Date().toISOString().slice(0, 10);

function getStatus(todo: TodoSummary): { label: string; cls: string } {
  if (todo.isCompleted) return { label: 'Completed', cls: 'status-done' };
  if (todo.dueDate && todo.dueDate < today) return { label: 'Overdue', cls: 'status-overdue' };
  return { label: 'Pending', cls: 'status-pending' };
}

export function TodoItem({ todo, onView, onComplete, onIncomplete, onEdit, onDelete }: Props) {
  const status = getStatus(todo);
  return (
    <li className={`todo-item ${todo.isCompleted ? 'completed' : ''}`}>
      <div className="todo-item-main">
        <span className="todo-title" onClick={() => onView(todo.id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onView(todo.id)}>
          {todo.title}
        </span>
        {todo.dueDate && <span className="todo-due">Due: {todo.dueDate}</span>}
        <span className={`todo-status ${status.cls}`}>{status.label}</span>
      </div>
      <div className="todo-actions">
        {todo.isCompleted
          ? <button onClick={() => onIncomplete(todo.id)}>Mark Incomplete</button>
          : <button onClick={() => onComplete(todo.id)}>Mark Complete</button>
        }
        <button onClick={() => onEdit(todo.id)}>Edit</button>
        <button onClick={() => onDelete(todo.id)} className="btn-danger">Delete</button>
      </div>
    </li>
  );
}
