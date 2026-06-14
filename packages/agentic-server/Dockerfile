FROM node:22-slim

WORKDIR /app

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/agentic-server/package.json packages/agentic-server/

# Install pnpm and dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile --filter @constructive-io/agentic-server

# Copy source and build
COPY packages/agentic-server/ packages/agentic-server/
COPY tsconfig.json ./
RUN pnpm --filter @constructive-io/agentic-server build

EXPOSE 3003

CMD ["node", "packages/agentic-server/dist/standalone.js"]
