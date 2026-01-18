# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY sdk.tgz /sdk.tgz
# Install deps for building (TypeScript, etc)
ENV NODE_ENV=development
# Use npm instead of pnpm for reliability in this context
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM constructive/node-runtime:latest

WORKDIR /usr/src/app

# Copy package.json just in case user has runtime-specific extra deps
COPY package.json ./
COPY sdk.tgz /usr/sdk.tgz
# Install PROD dependencies (if any extra needed beyond runtime)
RUN npm install -g pnpm@10.12.2 && pnpm install --prod

# Copy built artifacts
COPY --from=builder /app/dist ./dist

# CMD is inherited from base: ["node", "/runtime/runner.js", "/usr/src/app/dist/index.js"]
