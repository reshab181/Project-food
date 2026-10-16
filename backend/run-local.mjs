// Local dev runner: starts an in-memory MongoDB, seeds it (super admin + demo
// data), then boots the built backend server on 0.0.0.0:5000 so an emulator
// (10.0.2.2) or a LAN device can reach it. For local login testing only.
import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn } from 'node:child_process';

const mongod = await MongoMemoryServer.create({ instance: { port: 27050 } });
const uri = mongod.getUri('bambam-cake-shop');
console.log('[local] mongo:', uri);

const env = {
  ...process.env,
  MONGODB_URI: uri,
  JWT_ACCESS_SECRET: 'local_dev_access_secret_please_change',
  JWT_REFRESH_SECRET: 'local_dev_refresh_secret_please_change',
  PORT: '5000',
  NODE_ENV: 'development'
};

// Seed first (creates super admin admin@bambamcakeshop.com / Admin@123 + data)
console.log('[local] seeding...');
await new Promise((resolve, reject) => {
  const s = spawn('node', ['dist/seed.js'], { env, stdio: 'inherit' });
  s.on('exit', (c) => (c === 0 ? resolve() : reject(new Error('seed exit ' + c))));
});

console.log('[local] starting server on 0.0.0.0:5000 ...');
const server = spawn('node', ['dist/server.js'], { env, stdio: 'inherit' });

const shutdown = async () => {
  server.kill();
  await mongod.stop();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
