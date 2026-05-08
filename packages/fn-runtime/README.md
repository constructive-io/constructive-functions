# @constructive-io/fn-runtime

Runtime contract for Constructive Functions: wraps a typed handler in an Express app with a built-in GraphQL client, structured logger, and Knative job-callback support.

This is the package handler authors import directly. The `@constructive-io/fn-cli` toolchain stamps out function packages that depend on this runtime.

## Usage

```ts
import { createFunctionServer } from '@constructive-io/fn-runtime';
import type { FunctionHandler } from '@constructive-io/fn-types';

type Payload = { to: string; subject: string };

const handler: FunctionHandler<Payload, { ok: true }> = async (params, ctx) => {
  ctx.log.info('processing', { to: params.to });
  return { ok: true };
};

const app = createFunctionServer(handler, { name: 'my-function' });

if (require.main === module) {
  app.listen(Number(process.env.PORT || 8080));
}

export default app;
```

## What you get on `ctx`

- `ctx.job` — `{ jobId, workerId, databaseId }` lifted from `X-*` request headers.
- `ctx.client` / `ctx.meta` — GraphQL clients, configured via `GRAPHQL_URL` / `META_GRAPHQL_URL` env. Lazily created when `databaseId` is present; throw a helpful error if used without configuration.
- `ctx.log` — structured logger (`@pgpmjs/logger`).
- `ctx.env` — `process.env` reference for convenience.

The HTTP contract (one POST `/`, callback-on-finish) and error handling come from `@constructive-io/knative-job-fn` underneath, so the function plays nicely with the Constructive job-service.
