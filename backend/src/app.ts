import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import router from './routes';

export const app = express();

// Build the list of browser origins allowed by CORS. Native mobile apps
// (React Native / Expo) do not send an Origin header, so those requests are
// always allowed. Browser origins must be explicitly whitelisted.
const allowedOrigins = [
  env.CLIENT_APP_URL,
  env.ADMIN_APP_URL,
  ...(env.CORS_ORIGINS?.split(',') ?? [])
]
  .map((origin) => origin?.trim())
  .filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header -> non-browser client (mobile app, curl, server-to-
      // server, health checks). Allow it.
      if (!origin) {
        return callback(null, true);
      }
      // If no browser origins are configured, allow all (useful before the
      // production web URLs are known). Tighten this once URLs are set.
      if (allowedOrigins.length === 0) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true
  })
);
app.use(helmet());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '5mb' }));

// Simple root + health routes so hosting platforms (Render, Railway, etc.)
// can perform uptime/health checks without hitting the API prefix.
app.get('/', (_req, res) => {
  res.json({
    name: 'Bam Bam Cake Shop API',
    status: 'ok',
    docs: '/api/v1/health'
  });
});
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1', router);
app.use(notFoundHandler);
app.use(errorHandler);
