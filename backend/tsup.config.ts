import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    server: 'src/server.ts',
    seed: 'src/seed.ts'
  },
  outDir: 'dist',
  format: ['cjs'],
  target: 'node20',
  platform: 'node',
  sourcemap: true,
  clean: true,
  // Bundle the shared workspace package so TS path aliases resolve at runtime.
  // expo-server-sdk is ESM-only and is loaded via dynamic import() at runtime,
  // so it stays external. Everything else stays external too.
  noExternal: ['@bambam/shared']
});
