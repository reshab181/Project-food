import http from 'http';
import { Server } from 'socket.io';
import { app } from './app';
import { connectDatabase } from './config/db';
import { env } from './config/env';
import { registerSocketServer } from './services/socketService';

const bootstrap = async () => {
  await connectDatabase();
  const server = http.createServer(app);
  const allowedOrigins = [
    env.CLIENT_APP_URL,
    env.ADMIN_APP_URL,
    ...(env.CORS_ORIGINS?.split(',') ?? [])
  ]
    .map((origin) => origin?.trim())
    .filter((origin): origin is string => Boolean(origin));

  const io = new Server(server, {
    cors: {
      // Allow all origins if none are configured yet; otherwise restrict.
      origin: allowedOrigins.length > 0 ? allowedOrigins : '*'
    }
  });

  io.on('connection', (socket) => {
    socket.on('join:user', (userId: string) => {
      socket.join(`user:${userId}`);
    });

    socket.on('join:role', (role: string) => {
      socket.join(`role:${role}`);
    });
  });

  registerSocketServer(io);

  // Bind to 0.0.0.0 so the server is reachable inside cloud containers
  // (Render, Railway, Fly.io, Docker, etc.).
  server.listen(env.PORT, '0.0.0.0', () => {
    console.log(`Bam Bam backend running on port ${env.PORT}`);
  });
};

bootstrap().catch((error) => {
  console.error('Failed to start backend', error);
  process.exit(1);
});
