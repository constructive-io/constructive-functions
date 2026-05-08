# constructive-functions

Functions playground for Constructive — isolated workspace for building, testing, and deploying Knative-style HTTP functions.

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

This repo includes full Kubernetes manifests for deploying functions to any cluster.

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

The `CI Test K8s` workflow (`.github/workflows/test-k8s-deployment.yaml`) runs on every PR/push to `main` that touches `k8s/**`. It:

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
│   └── (custom type definitions for external packages)
├── package.json
├── pnpm-workspace.yaml
└── Makefile
```

## Notes

- Functions use `@constructive-io/knative-job-fn` for the Express/Knative HTTP wrapper
- Email providers use `@constructive-io/postmaster` (Mailgun) and `@launchql/mjml` (styled-email templates via MJML)
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
