import type { TodoSummary } from '../types/todo';

interface Props {
  todo: TodoSummary;
  onView: (id: string) => void;
  onComplete: (id: string) => void;
  onIncomplete: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onView, onComplete, onIncomplete, onEdit, onDelete }: Props) {
  return (
    <li className={`todo-item ${todo.isCompleted ? 'completed' : ''}`}>
      <div className="todo-item-main">
        <span className="todo-title" onClick={() => onView(todo.id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onView(todo.id)}>
          {todo.title}
        </span>
        {todo.dueDate && <span className="todo-due">Due: {todo.dueDate}</span>}
        <span className={`todo-status ${todo.isCompleted ? 'status-done' : 'status-pending'}`}>
          {todo.isCompleted ? 'Completed' : 'Pending'}
        </span>
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
