# Multi-stage Docker build for the Bam Bam Cake Shop backend.
# Build context MUST be the repo root (because of npm workspaces + the
# @bambam/shared package). Build from the repo root like:
#
#   docker build -f backend/Dockerfile -t bambam-backend .
#   docker run -p 5000:5000 --env-file backend/.env bambam-backend

# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Copy manifests first for better layer caching.
COPY package.json package-lock.json tsconfig.base.json ./
COPY backend/package.json ./backend/
COPY packages/shared/package.json ./packages/shared/

# Install all workspace dependencies (dev deps needed to build).
RUN npm install

# Copy the sources needed to build the backend.
COPY backend ./backend
COPY packages/shared ./packages/shared

# Build the backend into backend/dist (bundled CommonJS).
RUN npm --workspace @bambam/backend run build

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies for the backend workspace.
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY packages/shared/package.json ./packages/shared/
RUN npm install --omit=dev

# Copy the built output.
COPY --from=build /app/backend/dist ./backend/dist

EXPOSE 5000
WORKDIR /app/backend
CMD ["node", "dist/server.js"]
