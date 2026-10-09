import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { TodoItem } from '../components/TodoItem';
import type { TodoSummary } from '../types/todo';

const makeSummary = (overrides: Partial<TodoSummary> = {}): TodoSummary => ({
  id: 'abc',
  title: 'Buy milk',
  dueDate: null,
  isCompleted: false,
  createdAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

function renderItem(todo: TodoSummary, overrides = {}) {
  const handlers = {
    onView: vi.fn(),
    onComplete: vi.fn(),
    onIncomplete: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  };
  render(<TodoItem todo={todo} {...handlers} />);
  return handlers;
}

describe('TodoItem', () => {
  it('renders title and status badge', () => {
    renderItem(makeSummary());
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders due date when present', () => {
    renderItem(makeSummary({ dueDate: '2025-06-01' }));
    expect(screen.getByText('Due: 2025-06-01')).toBeInTheDocument();
  });

  it('does not render due date when absent', () => {
    renderItem(makeSummary({ dueDate: null }));
    expect(screen.queryByText(/Due:/)).not.toBeInTheDocument();
  });

  it('shows "Mark Complete" button when not completed', () => {
    renderItem(makeSummary({ isCompleted: false }));
    expect(screen.getByRole('button', { name: 'Mark Complete' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mark Incomplete' })).not.toBeInTheDocument();
  });

  it('shows "Mark Incomplete" button when completed', () => {
    renderItem(makeSummary({ isCompleted: true }));
    expect(screen.getByRole('button', { name: 'Mark Incomplete' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mark Complete' })).not.toBeInTheDocument();
  });

  it('shows "Completed" status badge when completed', () => {
    renderItem(makeSummary({ isCompleted: true }));
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('calls onView when title is clicked', async () => {
    const user = userEvent.setup();
    const { onView } = renderItem(makeSummary());
    await user.click(screen.getByRole('button', { name: 'Buy milk' }));
    expect(onView).toHaveBeenCalledWith('abc');
  });

  it('calls onComplete when "Mark Complete" is clicked', async () => {
    const user = userEvent.setup();
    const { onComplete } = renderItem(makeSummary({ isCompleted: false }));
    await user.click(screen.getByRole('button', { name: 'Mark Complete' }));
    expect(onComplete).toHaveBeenCalledWith('abc');
  });

  it('calls onIncomplete when "Mark Incomplete" is clicked', async () => {
    const user = userEvent.setup();
    const { onIncomplete } = renderItem(makeSummary({ isCompleted: true }));
    await user.click(screen.getByRole('button', { name: 'Mark Incomplete' }));
    expect(onIncomplete).toHaveBeenCalledWith('abc');
  });

  it('calls onEdit when Edit is clicked', async () => {
    const user = userEvent.setup();
    const { onEdit } = renderItem(makeSummary());
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledWith('abc');
  });

  it('calls onDelete when Delete is clicked', async () => {
    const user = userEvent.setup();
    const { onDelete } = renderItem(makeSummary());
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith('abc');
  });
});
