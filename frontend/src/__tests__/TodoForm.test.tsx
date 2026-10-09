import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { TodoForm } from '../components/TodoForm';

describe('TodoForm', () => {
  it('renders all form fields and submit button', () => {
    render(<TodoForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText('Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Todo' })).toBeInTheDocument();
  });

  it('blocks submit and shows error when title is empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TodoForm onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: 'Add Todo' }));
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with title only when optional fields are empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TodoForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText('Title *'), 'Buy milk');
    await user.click(screen.getByRole('button', { name: 'Add Todo' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ title: 'Buy milk' }));
  });

  it('includes description and dueDate when filled', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TodoForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText('Title *'), 'Task');
    await user.type(screen.getByLabelText('Description'), 'Details');
    await user.type(screen.getByLabelText('Due Date'), '2025-06-01');
    await user.click(screen.getByRole('button', { name: 'Add Todo' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ title: 'Task', description: 'Details', dueDate: '2025-06-01' }),
    );
  });

  it('resets fields after successful submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TodoForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText('Title *'), 'Buy milk');
    await user.click(screen.getByRole('button', { name: 'Add Todo' }));
    await waitFor(() => expect(screen.getByLabelText('Title *')).toHaveValue(''));
  });
});
