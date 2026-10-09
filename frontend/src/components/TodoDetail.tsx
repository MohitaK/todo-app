import type { TodoItem } from '../types/todo';

const today = new Date().toISOString().slice(0, 10);

function getStatus(todo: TodoItem): { label: string; cls: string } {
  if (todo.isCompleted) return { label: 'Completed', cls: 'status-done' };
  if (todo.dueDate && todo.dueDate < today) return { label: 'Overdue', cls: 'status-overdue' };
  return { label: 'Pending', cls: 'status-pending' };
}

interface Props {
  todo: TodoItem;
  onEdit: () => void;
  onComplete: (id: string) => void;
  onIncomplete: (id: string) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export function TodoDetail({ todo, onEdit, onComplete, onIncomplete, onDelete, onBack }: Props) {
  const status = getStatus(todo);
  return (
    <div className="todo-detail">
      <button onClick={onBack} className="btn-back">← Back</button>
      <h2>{todo.title}</h2>
      <div className="detail-fields">
        <div className="detail-row">
          <span className="detail-label">Status</span>
          <span className={`todo-status ${status.cls}`}>{status.label}</span>
        </div>
        {todo.description && (
          <div className="detail-row">
            <span className="detail-label">Description</span>
            <span>{todo.description}</span>
          </div>
        )}
        {todo.dueDate && (
          <div className="detail-row">
            <span className="detail-label">Due Date</span>
            <span>{todo.dueDate}</span>
          </div>
        )}
        <div className="detail-row">
          <span className="detail-label">Created</span>
          <span>{new Date(todo.createdAt).toLocaleString()}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Updated</span>
          <span>{new Date(todo.updatedAt).toLocaleString()}</span>
        </div>
      </div>
      <div className="todo-actions">
        {todo.isCompleted
          ? <button onClick={() => onIncomplete(todo.id)}>Mark Incomplete</button>
          : <button onClick={() => onComplete(todo.id)}>Mark Complete</button>
        }
        <button onClick={onEdit}>Edit</button>
        <button onClick={() => onDelete(todo.id)} className="btn-danger">Delete</button>
      </div>
    </div>
  );
}
