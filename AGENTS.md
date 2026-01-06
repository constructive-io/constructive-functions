# Constructive Functions Agent Guide

This guide helps AI agents quickly navigate the constructive-functions workspace.

## Quick Start

**Most important commands:**
- `pnpm build` — Build all function packages (TypeScript → `dist/`)
- `make docker-build` — Build Docker images for all functions
- `make docker-build-simple-email` — Build just the simple-email image
- `make docker-build-send-email-link` — Build just the send-email-link image
- `cd k8s && make kustomize-local` — Deploy functions to a local Kubernetes cluster

**Entry points:**
- Function HTTP handlers: `functions/*/src/index.ts`
- Docker entrypoints: `functions/*/Dockerfile` (`CMD ["node", "dist/index.js"]`)
- K8s manifests: `k8s/base/functions/*` and `k8s/overlays/local/functions/*`

## Monorepo Layout

- `functions/*` — Function packages (`send-email-link`, `simple-email`)
- `k8s/` — Kubernetes manifests, overlays, and setup scripts
- `types/` — Custom type definitions for `@launchql/*` packages

## Function Architecture

**Image naming:**

All Docker images use the registry prefix `ghcr.io/constructive-io/constructive-functions/`:

- `ghcr.io/constructive-io/constructive-functions/simple-email:latest`
- `ghcr.io/constructive-io/constructive-functions/send-email-link:latest`

The `REGISTRY` variable in the Makefile controls this prefix.

Both functions follow the same pattern:

1. **Source** (`src/index.ts`):
   - Import `app` from `@constructive-io/knative-job-fn` (Express app)
   - Define HTTP handler with `app.post('/', ...)`
   - Export `app` and start server if `require.main === module`
2. **Build** (`package.json` → `tsc`):
   - TypeScript compiles to `dist/index.js`
3. **Docker** (`Dockerfile`):
   - Uses `node:22-alpine`
   - Installs production deps via `pnpm`
   - Copies `dist/` and runs `node dist/index.js`

## Common Workflows

**Build all functions locally:**

```bash
pnpm install
pnpm build
```

**Build Docker images:**

```bash
make docker-build                    # Build all functions
make docker-build-simple-email         # Build one function
make docker-build-send-email-link
```

**Deploy to Kubernetes (local):**

```bash
cd k8s
make operators-knative-only   # Install Knative
make kustomize-local          # Apply manifests
make proxy-server            # Forward API to localhost:8080
```

**Run locally with Docker (manual):**

```bash
docker run -p 8080:8080 -e SIMPLE_EMAIL_DRY_RUN=true ghcr.io/constructive-io/constructive-functions/simple-email:latest
```

## Type Definitions

The `types/` directory contains manual type definitions for packages without built-in types:

- `@launchql/mjml` — Styled-email generator (MJML-based email templates)
- `@launchql/postmaster` — Mailgun email sender
- `@launchql/styled-email` — Email template components

These are referenced in `tsconfig.json` via `"typeRoots": ["./types", "./node_modules/@types"]`.

## Tips

1. Build functions before building Docker images — `dist/` must exist
2. Functions run on `PORT=8080` (Knative default)
3. Email functions support dry-run mode via env vars (`SIMPLE_EMAIL_DRY_RUN`, `SEND_EMAIL_LINK_DRY_RUN`)
4. K8s manifests reference Docker images; update image tags after pushing to registry
