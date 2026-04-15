FROM node:22-alpine AS build

WORKDIR /app

# Copy monorepo root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.json ./

# Copy packages
COPY packages ./packages
COPY templates ./templates
COPY functions ./functions
COPY scripts ./scripts

# Install pnpm and dependencies
RUN npm install -g pnpm@10 && \
    pnpm install --frozen-lockfile

# Generate only this function
RUN node --experimental-strip-types scripts/generate.ts --only={{name}}

# Build
RUN pnpm --filter @constructive-io/fn-runtime build && \
    pnpm --filter @constructive-io/{{name}}-fn build

# Deploy stage - create minimal production bundle
FROM node:22-alpine AS deploy

WORKDIR /app

RUN npm install -g pnpm@10

COPY --from=build /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=build /app/packages ./packages
COPY --from=build /app/generated/{{name}} ./generated/{{name}}

RUN pnpm install --frozen-lockfile --prod

# Runtime
FROM node:22-alpine

WORKDIR /app

COPY --from=deploy /app/node_modules ./node_modules
COPY --from=deploy /app/generated/{{name}}/dist ./dist
COPY --from=deploy /app/packages/fn-runtime/dist ./node_modules/@constructive-io/fn-runtime/dist

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

USER node

CMD ["node", "dist/index.js"]
