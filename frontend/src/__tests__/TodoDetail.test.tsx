import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { TodoDetail } from '../components/TodoDetail';
import type { TodoItem } from '../types/todo';

const makeTodo = (overrides: Partial<TodoItem> = {}): TodoItem => ({
  id: 'abc',
  title: 'Buy milk',
  description: 'From the store',
  dueDate: '2025-06-01',
  isCompleted: false,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-02-01T00:00:00.000Z',
  ...overrides,
});

const noop = vi.fn();

describe('TodoDetail', () => {
  it('renders title, description, dueDate, and timestamps', () => {
    render(<TodoDetail todo={makeTodo()} onEdit={noop} onComplete={noop} onIncomplete={noop} onDelete={noop} onBack={noop} />);
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(screen.getByText('From the store')).toBeInTheDocument();
    expect(screen.getByText('2025-06-01')).toBeInTheDocument();
  });

  it('does not render description row when description is null', () => {
    render(<TodoDetail todo={makeTodo({ description: null })} onEdit={noop} onComplete={noop} onIncomplete={noop} onDelete={noop} onBack={noop} />);
    expect(screen.queryByText('From the store')).not.toBeInTheDocument();
  });

  it('does not render due date row when dueDate is null', () => {
    render(<TodoDetail todo={makeTodo({ dueDate: null })} onEdit={noop} onComplete={noop} onIncomplete={noop} onDelete={noop} onBack={noop} />);
    expect(screen.queryByText('2025-06-01')).not.toBeInTheDocument();
  });

  it('shows "Pending" status and "Mark Complete" button when not completed', () => {
    render(<TodoDetail todo={makeTodo({ isCompleted: false })} onEdit={noop} onComplete={noop} onIncomplete={noop} onDelete={noop} onBack={noop} />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark Complete' })).toBeInTheDocument();
  });

  it('shows "Completed" status and "Mark Incomplete" button when completed', () => {
    render(<TodoDetail todo={makeTodo({ isCompleted: true })} onEdit={noop} onComplete={noop} onIncomplete={noop} onDelete={noop} onBack={noop} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark Incomplete' })).toBeInTheDocument();
  });

  it('calls onEdit when Edit is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<TodoDetail todo={makeTodo()} onEdit={onEdit} onComplete={noop} onIncomplete={noop} onDelete={noop} onBack={noop} />);
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalled();
  });

  it('calls onDelete with id when Delete is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<TodoDetail todo={makeTodo()} onEdit={noop} onComplete={noop} onIncomplete={noop} onDelete={onDelete} onBack={noop} />);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith('abc');
  });

  it('calls onBack when ← Back is clicked', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<TodoDetail todo={makeTodo()} onEdit={noop} onComplete={noop} onIncomplete={noop} onDelete={noop} onBack={onBack} />);
    await user.click(screen.getByRole('button', { name: '← Back' }));
    expect(onBack).toHaveBeenCalled();
  });
});
