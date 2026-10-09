import { validateCreateInput, validateUpdateInput } from '../domain/todo.validator';
import { ApiError } from '../errors/ApiError';

function catchApiError(fn: () => void): ApiError {
  try {
    fn();
    throw new Error('Expected ApiError to be thrown');
  } catch (err) {
    expect(err).toBeInstanceOf(ApiError);
    return err as ApiError;
  }
}

describe('validateCreateInput', () => {
  it('accepts title only', () => {
    expect(() => validateCreateInput({ title: 'Buy milk' })).not.toThrow();
  });

  it('accepts all optional fields populated', () => {
    expect(() =>
      validateCreateInput({ title: 'Task', description: 'Details', dueDate: '2025-06-01' }),
    ).not.toThrow();
  });

  it('accepts title at max length (255)', () => {
    expect(() => validateCreateInput({ title: 'a'.repeat(255) })).not.toThrow();
  });

  it('accepts description at max length (1000)', () => {
    expect(() => validateCreateInput({ title: 'T', description: 'a'.repeat(1000) })).not.toThrow();
  });

  it('accepts past dueDate', () => {
    expect(() => validateCreateInput({ title: 'T', dueDate: '2000-01-01' })).not.toThrow();
  });

  it('throws REQUIRED for empty title', () => {
    const err = catchApiError(() => validateCreateInput({ title: '' }));
    expect(err.fields).toStrictEqual({ title: 'REQUIRED' });
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.statusCode).toBe(400);
  });

  it('throws REQUIRED for whitespace-only title', () => {
    const err = catchApiError(() => validateCreateInput({ title: '   ' }));
    expect(err.fields).toStrictEqual({ title: 'REQUIRED' });
  });

  it('throws TOO_LONG for title exceeding 255 chars', () => {
    const err = catchApiError(() => validateCreateInput({ title: 'a'.repeat(256) }));
    expect(err.fields).toStrictEqual({ title: 'TOO_LONG' });
  });

  it('throws TOO_LONG for description exceeding 1000 chars', () => {
    const err = catchApiError(() =>
      validateCreateInput({ title: 'T', description: 'a'.repeat(1001) }),
    );
    expect(err.fields).toStrictEqual({ description: 'TOO_LONG' });
  });

  it('throws INVALID_FORMAT for non-date string', () => {
    const err = catchApiError(() => validateCreateInput({ title: 'T', dueDate: 'tomorrow' }));
    expect(err.fields).toStrictEqual({ dueDate: 'INVALID_FORMAT' });
  });

  it('throws INVALID_FORMAT for wrong date format (MM/DD/YYYY)', () => {
    const err = catchApiError(() => validateCreateInput({ title: 'T', dueDate: '01/01/2024' }));
    expect(err.fields).toStrictEqual({ dueDate: 'INVALID_FORMAT' });
  });

  it('throws INVALID_FORMAT for impossible calendar date', () => {
    const err = catchApiError(() => validateCreateInput({ title: 'T', dueDate: '2024-02-30' }));
    expect(err.fields).toStrictEqual({ dueDate: 'INVALID_FORMAT' });
  });

  it('throws INVALID_TYPE when description is not a string', () => {
    const err = catchApiError(() =>
      validateCreateInput({ title: 'T', description: 99 as unknown as string }),
    );
    expect(err.fields).toStrictEqual({ description: 'INVALID_TYPE' });
  });

  it('throws INVALID_TYPE when dueDate is not a string', () => {
    const err = catchApiError(() =>
      validateCreateInput({ title: 'T', dueDate: 20240101 as unknown as string }),
    );
    expect(err.fields).toStrictEqual({ dueDate: 'INVALID_TYPE' });
  });

  it('collects multiple field errors in one throw', () => {
    const err = catchApiError(() => validateCreateInput({ title: '', dueDate: 'bad' }));
    expect(err.fields).toStrictEqual({ title: 'REQUIRED', dueDate: 'INVALID_FORMAT' });
  });
});

describe('validateUpdateInput', () => {
  it('accepts title only', () => {
    expect(() => validateUpdateInput({ title: 'Updated' })).not.toThrow();
  });

  it('accepts null description and dueDate (explicit clear)', () => {
    expect(() =>
      validateUpdateInput({ title: 'T', description: null, dueDate: null }),
    ).not.toThrow();
  });

  it('throws REQUIRED for empty title', () => {
    const err = catchApiError(() => validateUpdateInput({ title: '' }));
    expect(err.fields).toStrictEqual({ title: 'REQUIRED' });
  });

  it('throws TOO_LONG for title exceeding 255 chars', () => {
    const err = catchApiError(() => validateUpdateInput({ title: 'a'.repeat(256) }));
    expect(err.fields).toStrictEqual({ title: 'TOO_LONG' });
  });

  it('throws TOO_LONG for description exceeding 1000 chars', () => {
    const err = catchApiError(() =>
      validateUpdateInput({ title: 'T', description: 'a'.repeat(1001) }),
    );
    expect(err.fields).toStrictEqual({ description: 'TOO_LONG' });
  });

  it('throws INVALID_FORMAT for invalid dueDate', () => {
    const err = catchApiError(() => validateUpdateInput({ title: 'T', dueDate: '2024-13-01' }));
    expect(err.fields).toStrictEqual({ dueDate: 'INVALID_FORMAT' });
  });
});
