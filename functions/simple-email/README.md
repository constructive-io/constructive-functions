# @constructive-io/simple-email-fn

Simple Knative-compatible email function used with the Constructive jobs system.

This function is intentionally minimal: it reads an email payload from the job
body and sends it via the configured email provider. When in dry-run mode, it
logs the payload only without sending.

## Expected job payload

Jobs should use `task_identifier = 'simple-email'` (or whatever route you
configure at your Knative gateway) and a JSON payload like:

```json
{
  "to": "user@example.com",
  "subject": "Welcome!",
  "html": "<p>Welcome to our app</p>"
}
```

Supported fields:

- `to` (string, required)
- `subject` (string, required)
- `html` (string, optional)
- `text` (string, optional)
- `from` (string, optional)
- `replyTo` (string, optional)

At least one of `html` or `text` must be provided. If required fields are
missing, the function throws and the error is propagated via the
`@constructive-io/knative-job-fn` wrapper as a job error.

## HTTP contract (with knative-job-worker)

The function is wrapped by `@constructive-io/knative-job-fn`, so it expects:

- HTTP method: `POST`
- Body: JSON job payload (see above)
- Headers (set by `@constructive-io/knative-job-worker`):
  - `X-Worker-Id`
  - `X-Job-Id`
  - `X-Database-Id`
  - `X-Callback-Url`

The handler:

1. Reads the email data directly from the request body.
2. Logs the email metadata (to/subject/from, and whether html/text are present)
   and the full payload.
3. Responds with HTTP 200 and:

```json
{ "complete": true }
```

Errors bubble into the error middleware installed by
`@constructive-io/knative-job-fn`, so they are translated into an `X-Job-Error`
callback for the worker.

## Environment variables

Optional:

- `SIMPLE_EMAIL_DRY_RUN` (`true`/`false`): log only, skip send.
- `EMAIL_SEND_USE_SMTP` (`true`/`false`): use SMTP (`simple-smtp-server`).

Mailgun (`@constructive-io/postmaster`) env vars when `EMAIL_SEND_USE_SMTP` is false:

- `MAILGUN_API_KEY`
- `MAILGUN_DOMAIN`
- `MAILGUN_FROM`

SMTP env vars when `EMAIL_SEND_USE_SMTP` is true:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

## Building locally

From the repo root:

```bash
pnpm --filter="@constructive-io/simple-email-fn" build
```

This compiles TypeScript into `dist/`.
