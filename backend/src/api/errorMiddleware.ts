import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/ApiError';

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      fields: err.fields,
    });
    return;
  }
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    fields: {},
  });
}
