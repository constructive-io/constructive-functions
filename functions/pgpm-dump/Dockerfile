FROM node:22-alpine

WORKDIR /usr/src/app

COPY functions/pgpm-dump/package.json ./
COPY sdk.tgz /usr/sdk.tgz
RUN npm install -g pnpm@10.12.2 && pnpm install --prod

COPY functions/pgpm-dump/dist ./dist

ENV NODE_ENV=production
ENV PORT=8080

USER node

CMD ["node", "dist/index.js"]
