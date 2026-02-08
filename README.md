# constructive-functions

Functions playground for Constructive — isolated workspace for building, testing, and deploying Knative-style HTTP functions.

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all functions
pnpm build

# Build Docker images locally
make docker-build

# Build individual function images
make docker-build-simple-email
make docker-build-send-email-link
```

## Functions

### `@constructive-io/simple-email-fn`

Simple email function that sends emails directly from job payload.

- **Port**: `8080`
- **Docker image**: `ghcr.io/constructive-io/constructive-functions/simple-email:latest`
- **Environment**:
  - `SIMPLE_EMAIL_DRY_RUN` — If `true`, logs email payload without sending
  - `MAILGUN_API_KEY`, `MAILGUN_KEY` — Mailgun credentials
  - `MAILGUN_DOMAIN`, `MAILGUN_FROM`, `MAILGUN_REPLY` — Mailgun email config

### `@constructive-io/send-email-link-fn`

Email link function for invite, password reset, and verification emails.

- **Port**: `8080`
- **Docker image**: `ghcr.io/constructive-io/constructive-functions/send-email-link:latest`
- **Environment**:
  - `SEND_EMAIL_LINK_DRY_RUN` — If `true`, logs email payload without sending
  - `DEFAULT_DATABASE_ID` — Default database UUID
  - `GRAPHQL_URL` — GraphQL API endpoint
  - `META_GRAPHQL_URL` — Meta GraphQL API endpoint (optional)
  - `GRAPHQL_AUTH_TOKEN` — Optional Bearer token for GraphQL requests
  - `LOCAL_APP_PORT` — Local port for dashboard links (e.g., `3000`)
  - `MAILGUN_*` — Same Mailgun config as `simple-email`

## Development

### Run a function with Node (local iteration / debugging)

Functions export a handler; the HTTP server is started by the shared runner. Do **not** run `node functions/.../dist/index.js` directly (it would exit immediately). Use one of:

**Option A — pnpm start (from repo root):**
```bash
pnpm install
pnpm --filter "@constructive-io/send-email-link-fn" run build
# Required env (e.g. for send-email-link): GRAPHQL_URL, SEND_EMAIL_LINK_DRY_RUN=true, PORT=8080
pnpm --filter "@constructive-io/send-email-link-fn" start
```

**Option B — runner explicitly (from repo root):**
```bash
pnpm install && pnpm --filter "@constructive-io/send-email-link-fn" run build
node functions/_runtimes/node/runner.js functions/send-email-link/dist/index.js
```

- **Port**: `8080` (default).
- **Env**: See each function's section above; at minimum set `*_DRY_RUN=true` and `GRAPHQL_URL` (if the function calls GraphQL). For full-stack or production, use Docker or the images below.

**Docker run (minimal, dry-run)** — the image validates Mailgun env at startup even when not sending; use placeholders to bring the container up for testing. Run detached (`-d`) so you can curl from the same host; use `docker logs <container_id>` if the container exits.

The runner uses `GRAPHQL_ENDPOINT` for the injected client; the function uses `GRAPHQL_URL`. For local docker run, set both to the same value (e.g. your host GraphQL URL).

```bash
docker run -d -p 8080:8080 --name send-email-link-test \
  -e SEND_EMAIL_LINK_DRY_RUN=true \
  -e MAILGUN_DOMAIN=local.example.com \
  -e MAILGUN_FROM=noreply@local.example.com \
  -e MAILGUN_REPLY=reply@local.example.com \
  -e MAILGUN_KEY=placeholder-key \
  -e MAILGUN_API_KEY=placeholder-api-key \
  -e GRAPHQL_URL=http://host.docker.internal:3000/graphql \
  -e GRAPHQL_ENDPOINT=http://host.docker.internal:3000/graphql \
  ghcr.io/constructive-io/constructive-functions/send-email-link:latest

# Then:
curl -X POST http://localhost:8080/ -H "Content-Type: application/json" -d '{}'
# Expected: JSON body like {"error":"Missing X-Database-Id header or DEFAULT_DATABASE_ID"} (400) — means the server is up.
# With header: curl -X POST http://localhost:8080/ -H "Content-Type: application/json" -H "X-Database-Id: <uuid>" -d '{"email_type":"invite_email","email":"a@b.com","invite_token":"x","sender_id":"<uuid>"}'
docker logs send-email-link-test   # if something fails
docker stop send-email-link-test && docker rm send-email-link-test
```

### Local Kubernetes (kind/minikube)

```bash
cd k8s

# Install Knative Serving + Kourier only (no CNPG)
make operators-knative-only

# Apply local overlay (single Postgres, single MinIO, functions)
make kustomize-local

# Port-forward to local services
make proxy-server   # GraphQL API -> localhost:8080
make proxy-explorer # GraphQL explorer UI -> localhost:8081
make proxy-web      # Dashboard UI -> localhost:3000
```

See `k8s/DEVELOPMENT_LOCAL.md` for detailed local setup.

### CI/CD

- **CI Lint & Build** (`.github/workflows/ci-lint-build.yaml`): On PR/push that touch `functions/send-email-link/**`, `functions/simple-email/**`, or root package config, runs lint and build (and optionally test) for those two packages.
- **CI Test K8s** (`.github/workflows/test-k8s-deployment.yaml`): Runs on every PR/push to `main` that touches `k8s/**`. It:

1. Spins up a `kind` cluster
2. Installs Knative via `make operators-knative-only`
3. Applies the `k8s/overlays/ci` overlay
4. Waits for workloads to be ready

## Project Structure

```
.
├── functions/
│   ├── send-email-link/
│   │   ├── src/
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   └── tsconfig.json
│   └── simple-email/
│       └── (same structure)
├── k8s/
│   ├── base/
│   ├── overlays/
│   ├── scripts/
│   └── Makefile
├── types/
│   └── (custom type definitions for launchql packages)
├── package.json
├── pnpm-workspace.yaml
└── Makefile
```

## Source of truth and images

- **Canonical source** for `send-email-link` and `simple-email` is the [constructive](https://github.com/constructive-io/constructive) repo (`constructive/functions/`). This repo builds and publishes **Docker images** for consumption by constructive (e.g. `docker-compose.jobs.yml`) and other environments.
- **Pushing images**: After merging to `main`, whoever is responsible for releases should run `make docker-build-send-email-link` (and/or `make docker-build-simple-email`) and push to GHCR. Downstream should use the `latest` tag unless a versioned tag is agreed.

## Notes

- Functions use `@constructive-io/knative-job-fn` for the Express/Knative HTTP wrapper
- Email providers use `@launchql/postmaster` (Mailgun) and `@launchql/mjml` (styled-email templates via MJML)
- No `docker-compose` — this repo is Kubernetes-focused for functions deployment
- Root workspace manages shared linting/formatting configs; each function has its own build config

## Pushing Images

To push to GitHub Container Registry:

```bash
docker push ghcr.io/constructive-io/constructive-functions/simple-email:latest
docker push ghcr.io/constructive-io/constructive-functions/send-email-link:latest
```

Images are built with the correct registry prefix via the Makefile:
- `make docker-build` — Builds all functions with `ghcr.io/constructive-io/constructive-functions/<name>:latest`
- `make docker-build-simple-email` — Builds `ghcr.io/constructive-io/constructive-functions/simple-email:latest`
- `make docker-build-send-email-link` — Builds `ghcr.io/constructive-io/constructive-functions/send-email-link:latest`
