import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(404, 'Resource not found.'));
};

export const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  // Log unexpected errors server-side so 500s are diagnosable.
  console.error('[errorHandler] Unhandled error:', error);

  return res.status(500).json({
    message: 'Internal server error.',
    detail: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};
