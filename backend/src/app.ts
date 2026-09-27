import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import router from './routes';

export const app = express();
const allowedOrigins = [
  env.CLIENT_APP_URL,
  env.ADMIN_APP_URL,
  // Always allow local dev origins so the web app works without env config
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:19006'
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));

app.use('/api/v1', router);
app.use(notFoundHandler);
app.use(errorHandler);
