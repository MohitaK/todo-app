import { ApiError } from '../errors/ApiError';
import type { CreateTodoInput, UpdateTodoInput } from './todo.types';

const TITLE_MAX = 255;
const DESCRIPTION_MAX = 1000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const year = parseInt(value.slice(0, 4), 10);
  if (year < 1900 || year > 2100) return false;
  const d = new Date(value);
  return !isNaN(d.getTime()) && d.toISOString().startsWith(value);
}

type FieldErrors = Record<string, 'REQUIRED' | 'INVALID_FORMAT' | 'INVALID_TYPE' | 'TOO_LONG'>;

function validateOptionalFields(
  input: { description?: string | null; dueDate?: string | null },
  fields: FieldErrors,
): void {
  if (input.description !== undefined && input.description !== null) {
    if (typeof input.description !== 'string') {
      fields['description'] = 'INVALID_TYPE';
    } else if (input.description.length > DESCRIPTION_MAX) {
      fields['description'] = 'TOO_LONG';
    }
  }
  if (input.dueDate !== undefined && input.dueDate !== null) {
    if (typeof input.dueDate !== 'string') {
      fields['dueDate'] = 'INVALID_TYPE';
    } else if (!isValidDate(input.dueDate)) {
      fields['dueDate'] = 'INVALID_FORMAT';
    }
  }
}

export function validateCreateInput(input: CreateTodoInput): void {
  const fields: FieldErrors = {};
  if (!input.title || input.title.trim().length === 0) {
    fields['title'] = 'REQUIRED';
  } else if (input.title.length > TITLE_MAX) {
    fields['title'] = 'TOO_LONG';
  }
  validateOptionalFields(input, fields);
  if (Object.keys(fields).length > 0) throw ApiError.validationError(fields);
}

export function validateUpdateInput(input: UpdateTodoInput): void {
  const fields: FieldErrors = {};
  if (!input.title || input.title.trim().length === 0) {
    fields['title'] = 'REQUIRED';
  } else if (input.title.length > TITLE_MAX) {
    fields['title'] = 'TOO_LONG';
  }
  validateOptionalFields(input, fields);
  if (Object.keys(fields).length > 0) throw ApiError.validationError(fields);
}
