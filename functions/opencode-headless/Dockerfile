FROM node:22-alpine

WORKDIR /usr/src/app

COPY functions/opencode-headless/package.json ./
COPY sdk.tgz /usr/sdk.tgz
RUN npm install -g pnpm@10.12.2 && pnpm install --prod

COPY functions/opencode-headless/dist ./dist
COPY bin ./bin


ENV NODE_ENV=production
ENV PORT=8080

USER node

CMD ["node", "dist/index.js"]
