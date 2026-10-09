import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach } from 'vitest';
import App from '../App';
import * as todosApi from '../api/todos';
import type { TodoItem, TodoSummary } from '../types/todo';

vi.mock('../api/todos');

const makeSummary = (overrides: Partial<TodoSummary> = {}): TodoSummary => ({
  id: 'abc',
  title: 'Buy milk',
  dueDate: null,
  isCompleted: false,
  createdAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

const makeTodo = (overrides: Partial<TodoItem> = {}): TodoItem => ({
  id: 'abc',
  title: 'Buy milk',
  description: null,
  dueDate: null,
  isCompleted: false,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

beforeEach(() => {
  vi.mocked(todosApi.fetchTodos).mockResolvedValue([]);
  vi.mocked(todosApi.createTodo).mockResolvedValue(makeTodo());
  vi.mocked(todosApi.getTodo).mockResolvedValue(makeTodo());
  vi.mocked(todosApi.updateTodo).mockResolvedValue(makeTodo());
  vi.mocked(todosApi.completeTodo).mockResolvedValue(makeTodo({ isCompleted: true }));
  vi.mocked(todosApi.incompleteTodo).mockResolvedValue(makeTodo({ isCompleted: false }));
  vi.mocked(todosApi.deleteTodo).mockResolvedValue(undefined);
});

describe('App', () => {
  it('shows empty state after initial load', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText(/no todos yet/i)).toBeInTheDocument());
  });

  it('renders todos returned by fetchTodos', async () => {
    vi.mocked(todosApi.fetchTodos).mockResolvedValue([makeSummary({ title: 'Buy milk' })]);
    render(<App />);
    await waitFor(() => expect(screen.getByText('Buy milk')).toBeInTheDocument());
  });

  it('creates a todo and refreshes the list', async () => {
    const user = userEvent.setup();
    vi.mocked(todosApi.fetchTodos)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([makeSummary({ title: 'New task' })]);
    render(<App />);
    await waitFor(() => screen.getByLabelText('Title *'));
    await user.type(screen.getByLabelText('Title *'), 'New task');
    await user.click(screen.getByRole('button', { name: 'Add Todo' }));
    await waitFor(() => expect(screen.getByText('New task')).toBeInTheDocument());
  });

  it('switches to detail view when a todo title is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(todosApi.fetchTodos).mockResolvedValue([makeSummary()]);
    vi.mocked(todosApi.getTodo).mockResolvedValue(makeTodo({ title: 'Buy milk', description: 'Details' }));
    render(<App />);
    await waitFor(() => screen.getByRole('button', { name: 'Buy milk' }));
    await user.click(screen.getByRole('button', { name: 'Buy milk' }));
    await waitFor(() => expect(screen.getByText('Details')).toBeInTheDocument());
  });

  it('switches to edit view when Edit is clicked from the list', async () => {
    const user = userEvent.setup();
    vi.mocked(todosApi.fetchTodos).mockResolvedValue([makeSummary()]);
    render(<App />);
    await waitFor(() => screen.getByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument());
  });

  it('returns to list view when Cancel is clicked in EditForm', async () => {
    const user = userEvent.setup();
    vi.mocked(todosApi.fetchTodos).mockResolvedValue([makeSummary()]);
    render(<App />);
    await waitFor(() => screen.getByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await waitFor(() => screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add Todo' })).toBeInTheDocument());
  });

  it('deletes a todo and stays on list view', async () => {
    const user = userEvent.setup();
    vi.mocked(todosApi.fetchTodos)
      .mockResolvedValueOnce([makeSummary()])
      .mockResolvedValueOnce([]);
    render(<App />);
    await waitFor(() => screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(screen.getByText(/no todos yet/i)).toBeInTheDocument());
  });

  it('shows error banner when fetchTodos fails', async () => {
    vi.mocked(todosApi.fetchTodos).mockRejectedValue({ message: 'Network error' });
    render(<App />);
    await waitFor(() => expect(screen.getByText('Network error')).toBeInTheDocument());
  });
});
