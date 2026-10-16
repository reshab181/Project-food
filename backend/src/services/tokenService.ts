import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const signAccessToken = (payload: { userId: string; role: string }) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });

export const signRefreshToken = (payload: { userId: string; role: string }) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
