# Build from repo root so we can copy the shared runner:
#   docker build -t <tag> -f functions/simple-email/Dockerfile .
FROM node:22-alpine

WORKDIR /usr/src/app

COPY functions/simple-email/package.json ./

RUN npm install -g pnpm@10.12.2 && pnpm install --prod

COPY functions/simple-email/dist ./dist
COPY functions/_runtimes/node/runner.js ./

ENV NODE_ENV=production
ENV PORT=8080

USER node

CMD ["node", "runner.js", "dist/index.js"]
