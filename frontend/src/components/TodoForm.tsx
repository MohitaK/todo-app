import { useState } from 'react';
import type { CreateTodoInput } from '../types/todo';

interface Props {
  onSubmit: (input: CreateTodoInput) => Promise<void>;
}

export function TodoForm({ onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
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
        ...(description ? { description } : {}),
        ...(dueDate ? { dueDate } : {}),
      });
      setTitle('');
      setDescription('');
      setDueDate('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <h2>Add Todo</h2>
      <div className="field">
        <label htmlFor="new-title">Title *</label>
        <input
          id="new-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
        />
        {titleError && <span className="field-error">{titleError}</span>}
      </div>
      <div className="field">
        <label htmlFor="new-desc">Description</label>
        <textarea
          id="new-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details"
          rows={2}
        />
      </div>
      <div className="field">
        <label htmlFor="new-due">Due Date</label>
        <input
          id="new-due"
          type="date"
          value={dueDate}
          min="1900-01-01"
          max="2100-12-31"
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Adding…' : 'Add Todo'}
      </button>
    </form>
  );
}
