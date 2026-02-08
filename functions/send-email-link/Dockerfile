# Build from repo root so we can copy the shared runner and lockfile:
#   docker build -t <tag> -f functions/send-email-link/Dockerfile .
FROM node:22-alpine

WORKDIR /usr/src/app

# Copy lockfile and workspace so pnpm install is reproducible
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY functions/send-email-link/package.json ./functions/send-email-link/

RUN npm install -g pnpm@10.12.2 && \
    pnpm install --frozen-lockfile --prod --filter "@constructive-io/send-email-link-fn"

COPY functions/send-email-link/dist ./functions/send-email-link/dist
COPY functions/_runtimes/node/runner.js ./

ENV NODE_ENV=production
ENV PORT=8080

USER node

# Runner loads dist/index.js and starts the HTTP server (keeps process alive)
CMD ["node", "runner.js", "functions/send-email-link/dist/index.js"]
