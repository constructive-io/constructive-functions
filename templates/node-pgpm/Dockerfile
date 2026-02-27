FROM node:22-alpine AS build
RUN apk add --no-cache git
RUN npm install -g pnpm@10.12.2
WORKDIR /app
COPY . .
RUN node --experimental-strip-types scripts/generate.ts \
    && pnpm install --frozen-lockfile \
    && pnpm --filter @constructive-io/{{name}}-fn... build

FROM node:22-alpine AS deploy
RUN apk add --no-cache git
RUN npm install -g pnpm@10.12.2
COPY --from=build /app /app
WORKDIR /app
RUN pnpm --filter @constructive-io/{{name}}-fn deploy --legacy /deploy --prod

FROM node:22-alpine
RUN apk add --no-cache git
WORKDIR /app
COPY --from=deploy /deploy .
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "dist/index.js"]
