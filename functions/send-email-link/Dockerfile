# Build from repo root so we can copy the shared runner:
#   docker build -t <tag> -f functions/send-email-link/Dockerfile .
FROM node:22-alpine

WORKDIR /usr/src/app

# Copy only package.json first for better layer caching
COPY functions/send-email-link/package.json ./

RUN npm install -g pnpm@10.12.2 && pnpm install --prod

COPY functions/send-email-link/dist ./dist
COPY functions/_runtimes/node/runner.js ./

ENV NODE_ENV=production
ENV PORT=8080

USER node

# Runner loads dist/index.js and starts the HTTP server (keeps process alive)
CMD ["node", "runner.js", "dist/index.js"]
