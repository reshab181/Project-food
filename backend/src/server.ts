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
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:19006'
  ].filter((origin): origin is string => Boolean(origin));

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true
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

  server.once('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${env.PORT} is already in use. Stop the existing backend process or set a different PORT in backend/.env.`);
    } else {
      console.error('Failed to start HTTP server', error);
    }
    process.exit(1);
  });

  server.listen(env.PORT, () => {
    console.log(`Bam Bam backend running on port ${env.PORT}`);
  });
};

bootstrap().catch((error) => {
  console.error('Failed to start backend', error);
  process.exit(1);
});
