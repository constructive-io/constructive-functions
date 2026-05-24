# constructive-functions

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive-functions/actions/workflows/ci.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive-functions/actions/workflows/ci.yaml/badge.svg" />
  </a>
  <a href="https://github.com/constructive-io/constructive-functions/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-Constructive-blue.svg"/></a>
</p>

Functions playground for Constructive — a workspace for building, testing, and deploying serverless HTTP functions backed by a Postgres-backed job queue.

Functions are authored in `functions/<name>/` (a `handler.ts` plus a `handler.json` manifest), generated into runnable workspace packages by `pnpm generate`, and dispatched by the job service in `job/service/`. Templates live in `templates/` (`node-graphql` and `python` are supported today).

This repo is also the source of the **Portable Functions Toolkit**: a set of `@constructive-io/fn-*` npm packages that any external repo can `pnpm add` to get the same code-gen + Docker + k8s pipeline against its own `functions/` directory. See [docs/portable-functions-toolkit.md](docs/portable-functions-toolkit.md) for the full toolkit guide.

## Quick start (in another repo)

```bash
pnpm add -D @constructive-io/fn-cli
pnpm add @constructive-io/fn-runtime

pnpm fn init send-welcome --no-tty           # scaffold functions/send-welcome/
pnpm fn generate                             # stamp out generated/<name>/ packages
pnpm install                                 # link the new workspaces
pnpm fn build                                # compile
pnpm fn dev                                  # run functions as local Node processes
```

## Quick start (this repo, dogfood)

```bash
pnpm generate     # generate workspace packages from handler.json manifests
pnpm install      # install dependencies (including generated packages)
pnpm build        # build all packages and functions

make docker-build                        # build all function Docker images
make docker-build-send-email           # build a single function image
make docker-build-send-verification-link
```

## Functions

| Function | Port | Type | Image |
|----------|------|------|-------|
| `send-email` | 8081 | node-graphql | `ghcr.io/constructive-io/send-email-fn:latest` |
| `send-verification-link` | 8082 | node-graphql | `ghcr.io/constructive-io/send-verification-link-fn:latest` |
| `knative-job-example` | 8083 | node-graphql | `ghcr.io/constructive-io/knative-job-example-fn:latest` |
| `python-example` | 8084 | python | `ghcr.io/constructive-io/python-example-fn:latest` |

Port `8080` is reserved for the job service.

### `send-email`

Sends emails directly from a job payload.

- `SEND_EMAIL_DRY_RUN` — if `true`, logs the payload instead of sending
- `MAILGUN_API_KEY`, `MAILGUN_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_FROM`, `MAILGUN_REPLY` — Mailgun config

### `send-verification-link`

Sends invite, password reset, and verification emails (rendered via MJML).

- `SEND_VERIFICATION_LINK_DRY_RUN` — if `true`, logs the payload instead of sending
- `DEFAULT_DATABASE_ID` — default database UUID
- `GRAPHQL_URL`, `META_GRAPHQL_URL` — GraphQL API endpoints
- `GRAPHQL_AUTH_TOKEN` — optional Bearer token for GraphQL requests
- `LOCAL_APP_PORT` — local port for dashboard links (e.g. `3000`)
- `MAILGUN_*` — same Mailgun config as `send-email`

### `knative-job-example` / `python-example`

Reference implementations for the `node-graphql` and `python` templates.

## Development

The full local-dev guide lives in [DEVELOPMENT.md](./DEVELOPMENT.md). Two paths:

- **Docker Compose + local Node** (fastest iteration) — `make dev` for infrastructure, `make dev-fn` to run functions as local Node processes.
- **Skaffold on local k8s** (production-like, with hot reload) — `make skaffold-dev` deploys the full stack to the `constructive-functions` namespace and watches handler files.

For the Knative variant of the k8s setup, see `k8s/DEVELOPMENT_LOCAL.md`.

### CI/CD

The `CI Test K8s` workflow (`.github/workflows/test-k8s-deployment.yaml`) runs on PRs and pushes to `main` that touch `k8s/`, `tests/e2e/`, or `functions/`. It spins up a `kind` cluster, applies the `k8s/overlays/ci` overlay, and runs the per-function e2e tests.

## Project Structure

```
.
├── functions/             # User-authored handler.ts + handler.json (git tracked)
├── templates/             # Template definitions (node-graphql, python, shared, k8s)
├── generated/             # Generated workspace packages (gitignored)
├── packages/
│   ├── fn-runtime/        # createFunctionServer, GraphQL clients, FunctionContext
│   └── fn-app/            # Express app factory with job callbacks
├── job/
│   ├── service/           # Orchestrator (loads functions + worker + scheduler)
│   ├── server/            # Callback receiver
│   └── worker/            # Job dispatcher
├── k8s/
│   ├── base/              # Shared manifests
│   └── overlays/          # local-simple, local, ci, dev, staging
├── tests/                 # integration + e2e suites
├── scripts/               # generate.ts, dev.ts, docker-build.ts
├── skaffold.yaml
├── package.json
└── Makefile
```

## Notes

- Functions use `@constructive-io/fn-runtime` (runtime + GraphQL clients) and `@constructive-io/fn-app` (Express wrapper).
- Email providers are wired through `@constructive-io/postmaster` (Mailgun) and `@launchql/mjml` / `@launchql/styled-email` for templating.
- Both Node (`node-graphql`) and Python (`python`) templates are supported — pick via the `type` field in `handler.json`.
- The `generated/` directory is entirely gitignored; rerun `pnpm generate` after changing any `handler.json`.
- Root workspace manages shared linting/formatting; each generated function ships its own build config and Dockerfile.

## Pushing Images

Images are tagged with the GHCR prefix automatically:

```bash
docker push ghcr.io/constructive-io/send-email-fn:latest
docker push ghcr.io/constructive-io/send-verification-link-fn:latest
docker push ghcr.io/constructive-io/knative-job-example-fn:latest
docker push ghcr.io/constructive-io/python-example-fn:latest
```

- `make docker-build` — builds all function images
- `make docker-build-<name>` — builds a single function image
