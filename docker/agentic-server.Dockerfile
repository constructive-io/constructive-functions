FROM node:22-slim

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY scripts/dev-agent.ts scripts/

# Install pnpm and dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile --prod

EXPOSE 3003

CMD ["node", "--experimental-strip-types", "scripts/dev-agent.ts"]
