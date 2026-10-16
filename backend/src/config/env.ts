import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(8),
  JWT_REFRESH_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_APP_URL: z.string().optional(),
  ADMIN_APP_URL: z.string().optional(),
  // Optional comma-separated list of extra browser origins allowed by CORS
  // (e.g. the deployed web builds of the customer/admin apps).
  CORS_ORIGINS: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  EXPO_ACCESS_TOKEN: z.string().optional(),
  // Phone OTP settings. Twilio is optional: when the three TWILIO_* vars are
  // present, OTPs are sent as real SMS. Otherwise the backend runs in a dev
  // fallback that logs/returns the code so it can be tested without a provider.
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(),
  OTP_TTL_SECONDS: z.coerce.number().default(300),
  OTP_LENGTH: z.coerce.number().min(4).max(8).default(6),
  OTP_MAX_ATTEMPTS: z.coerce.number().default(5),
  // When true (default in non-production), the OTP code is included in the
  // request-otp API response and server logs for easy local testing.
  OTP_EXPOSE_IN_DEV: z
    .string()
    .optional()
    .transform((v) => v !== 'false')
});

export const env = envSchema.parse(process.env);
