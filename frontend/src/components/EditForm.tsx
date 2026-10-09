import { useState } from 'react';
import type { TodoItem, UpdateTodoInput } from '../types/todo';

interface Props {
  todo: TodoItem;
  onSubmit: (input: UpdateTodoInput) => Promise<void>;
  onCancel: () => void;
}

export function EditForm({ todo, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description ?? '');
  const [dueDate, setDueDate] = useState(todo.dueDate ?? '');
  const [titleError, setTitleError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }
    setTitleError('');
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description === '' ? null : description,
        dueDate: dueDate === '' ? null : dueDate,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <h2>Edit Todo</h2>
      <div className="field">
        <label htmlFor="edit-title">Title *</label>
        <input
          id="edit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {titleError && <span className="field-error">{titleError}</span>}
      </div>
      <div className="field">
        <label htmlFor="edit-desc">Description</label>
        <textarea
          id="edit-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Clear to remove"
          rows={2}
        />
      </div>
      <div className="field">
        <label htmlFor="edit-due">Due Date</label>
        <input
          id="edit-due"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <div className="form-actions">
        <button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
