import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { EditForm } from '../components/EditForm';
import type { TodoItem } from '../types/todo';

const makeTodo = (overrides: Partial<TodoItem> = {}): TodoItem => ({
  id: 'abc',
  title: 'Original title',
  description: 'Original desc',
  dueDate: '2025-06-01',
  isCompleted: false,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

describe('EditForm', () => {
  it('prefills fields from the todo', () => {
    render(<EditForm todo={makeTodo()} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText('Title *')).toHaveValue('Original title');
    expect(screen.getByLabelText('Description')).toHaveValue('Original desc');
  });

  it('prefills empty string when description is null', () => {
    render(<EditForm todo={makeTodo({ description: null })} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText('Description')).toHaveValue('');
  });

  it('submits updated values', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<EditForm todo={makeTodo()} onSubmit={onSubmit} onCancel={vi.fn()} />);
    await user.clear(screen.getByLabelText('Title *'));
    await user.type(screen.getByLabelText('Title *'), 'New title');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: 'New title' })),
    );
  });

  it('sends null for description when cleared', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<EditForm todo={makeTodo()} onSubmit={onSubmit} onCancel={vi.fn()} />);
    await user.clear(screen.getByLabelText('Description'));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ description: null })),
    );
  });

  it('shows title required error when submitted empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<EditForm todo={makeTodo()} onSubmit={onSubmit} onCancel={vi.fn()} />);
    await user.clear(screen.getByLabelText('Title *'));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<EditForm todo={makeTodo()} onSubmit={vi.fn()} onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });
});
