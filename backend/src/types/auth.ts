import { Request } from 'express';

export interface AuthUser {
  userId: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  auth?: AuthUser;
}
