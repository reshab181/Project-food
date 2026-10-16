import jwt from 'jsonwebtoken';
import { NextFunction, Response } from 'express';
import { env } from '../config/env';
import { AuthenticatedRequest } from '../types/auth';
import { ApiError } from '../utils/ApiError';

export const requireAuth = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    return next(new ApiError(401, 'Authentication required.'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string; role: string };
    req.auth = payload;
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired token.'));
  }
};
