import { render, screen } from '@testing-library/react';
import { TodoList } from '../components/TodoList';
import type { TodoSummary } from '../types/todo';

const noop = () => {};
const props = { onView: noop, onComplete: noop, onIncomplete: noop, onEdit: noop, onDelete: noop };

const makeSummary = (overrides: Partial<TodoSummary> = {}): TodoSummary => ({
  id: '1',
  title: 'Test Todo',
  dueDate: null,
  isCompleted: false,
  createdAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

describe('TodoList', () => {
  it('shows empty state when there are no todos', () => {
    render(<TodoList todos={[]} {...props} />);
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
  });

  it('renders one row per todo', () => {
    const todos = [
      makeSummary({ id: '1', title: 'First' }),
      makeSummary({ id: '2', title: 'Second' }),
    ];
    render(<TodoList todos={todos} {...props} />);
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('does not show empty state when todos exist', () => {
    render(<TodoList todos={[makeSummary()]} {...props} />);
    expect(screen.queryByText(/no todos yet/i)).not.toBeInTheDocument();
  });
});
