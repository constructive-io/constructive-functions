# @constructive-io/knative-job-fn

Express app factory for Knative-style job functions. Provides:

- One POST `/` endpoint with JSON body parsing and request logging.
- Per-request job context lifted from `X-Worker-Id`, `X-Job-Id`, `X-Database-Id`, `X-Callback-Url` headers.
- An on-finish hook that POSTs `{status: "success" | "error"}` to the callback URL when set.
- Centralized error middleware that emits an error callback and a 200 with `{message}` body (Knative requires 2xx for delivery acknowledgment).

Most users should depend on `@constructive-io/fn-runtime`, which wraps this with a typed handler and GraphQL clients. Use this package directly only if you need raw Express middleware control.

```ts
import { createJobApp } from '@constructive-io/knative-job-fn';

const app = createJobApp();
app.post('/', (req, res) => {
  res.json({ ok: true });
});
app.listen(8080);
```
