import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { ApiError } from '../utils/ApiError';

export const allowRoles = (...roles: string[]) => (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  if (!req.auth || !roles.includes(req.auth.role)) {
    return next(new ApiError(403, 'You do not have permission to perform this action.'));
  }

  next();
};
