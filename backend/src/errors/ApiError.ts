type ErrorCode = 'VALIDATION_ERROR' | 'NOT_FOUND' | 'INTERNAL_ERROR';
type FieldError = 'REQUIRED' | 'INVALID_FORMAT' | 'INVALID_TYPE' | 'TOO_LONG';

export class ApiError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly fields: Record<string, FieldError>,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static validationError(fields: Record<string, FieldError>): ApiError {
    return new ApiError('VALIDATION_ERROR', 'Validation failed', fields, 400);
  }

  static notFound(message: string): ApiError {
    return new ApiError('NOT_FOUND', message, {}, 404);
  }

  static internalError(message: string): ApiError {
    return new ApiError('INTERNAL_ERROR', message, {}, 500);
  }
}
