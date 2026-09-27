import { NextFunction, Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(404, 'Resource not found.'));
};

export const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Invalid request data.',
      errors: error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }))
    });
  }

  if (error instanceof MongooseError.ValidationError || error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid request data.' });
  }

  if ((error as { code?: number }).code === 11000) {
    return res.status(409).json({ message: 'A record with those values already exists.' });
  }

  return res.status(500).json({
    message: 'Internal server error.',
    detail: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};
