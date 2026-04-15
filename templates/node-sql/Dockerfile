FROM node:22-alpine AS build
RUN npm install -g pnpm@10.12.2
WORKDIR /app
COPY . .
RUN node --experimental-strip-types scripts/generate.ts --only={{name}} \
    && pnpm install --frozen-lockfile \
    && pnpm --filter @constructive-io/{{name}}-fn... build

FROM node:22-alpine AS deploy
RUN npm install -g pnpm@10.12.2
COPY --from=build /app /app
WORKDIR /app
RUN pnpm --filter @constructive-io/{{name}}-fn deploy --legacy /deploy --prod

FROM node:22-alpine
WORKDIR /app
COPY --from=deploy /deploy .
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "dist/index.js"]
