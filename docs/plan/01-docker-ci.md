# WS1: Docker Build CI Workflow

**Branch**: `feat/docker-ci`
**Dependencies**: None — can start immediately
**Estimated files**: 1 new

## Context

Per-function Docker images are built locally via `scripts/docker-build.ts` (reads `generated/<name>/Dockerfile`). There is no CI workflow to build and push these images to GHCR.

### Current state
- `scripts/docker-build.ts` — local build script supporting `--all`, `--only=<name>`, `--tag=<tag>`, `--registry=<registry>`
- `scripts/generate.ts` — generates `generated/<name>/Dockerfile` from `templates/node-graphql/Dockerfile` with `{{name}}` replaced
- Each generated Dockerfile is a 3-stage build that runs `generate.ts --only=<name>` inside the container, then `pnpm install`, `pnpm build`, `pnpm deploy`
- Existing K8s CI workflow at `.github/workflows/test-k8s-deployment.yaml` only tests Knative installation, not Docker builds

### Reference pattern
Follow `constructive-db/.github/workflows/docker.yaml`:
- Matrix strategy for multiple image targets
- `docker/metadata-action@v5` for tag generation
- `docker/build-push-action@v5` with `push: ${{ github.event_name != 'pull_request' }}`
- GHCR login only on non-PR events
- GHA build cache (`cache-from: type=gha`, `cache-to: type=gha,mode=max`)
- Concurrency groups

## Requirements

1. Build Docker images for every function discovered in `functions/*/handler.json`
2. On **push to main**: build AND push to GHCR
3. On **pull request**: build only (no push) — validates the Dockerfile works
4. On **workflow_dispatch**: manual trigger, build + push
5. Dynamic function discovery — no hardcoded function list in the workflow
6. Per-function cache scoping to avoid cache eviction between functions
7. Image naming: `ghcr.io/<owner>/<name>-fn` (matches `docker-build.ts` convention)
8. Tags: latest (on default branch), git SHA (short), semver (on tags)

## Implementation

### Create `.github/workflows/docker.yaml`

```yaml
name: Publish Docker Images

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch: {}

permissions:
  contents: read
  packages: write

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}-docker
  cancel-in-progress: true

jobs:
  discover:
    name: Discover functions
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.find.outputs.matrix }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Find functions from handler.json
        id: find
        run: |
          entries=$(
            for f in functions/*/handler.json; do
              [ -f "$f" ] || continue
              name=$(jq -r .name "$f")
              dir=$(dirname "$f" | xargs basename)
              echo "{\"name\":\"$name\",\"dir\":\"$dir\"}"
            done | jq -s -c '.'
          )
          echo "matrix={\"include\":$entries}" >> "$GITHUB_OUTPUT"
          echo "Discovered functions: $entries"

  build:
    name: Build ${{ matrix.name }}-fn
    needs: discover
    runs-on: ubuntu-latest
    if: ${{ needs.discover.outputs.matrix != '{"include":[]}' }}

    strategy:
      fail-fast: false
      matrix: ${{ fromJSON(needs.discover.outputs.matrix) }}

    env:
      REGISTRY: ghcr.io

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Generate Dockerfile
        run: |
          node --experimental-strip-types scripts/generate.ts --only=${{ matrix.dir }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GHCR
        if: github.event_name != 'pull_request'
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Docker meta
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ github.repository_owner }}/${{ matrix.name }}-fn
          tags: |
            type=ref,event=tag
            type=semver,pattern={{version}}
            type=raw,value=latest,enable=${{ github.ref == format('refs/heads/{0}', github.event.repository.default_branch) }}
            type=sha,format=short,prefix=

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: generated/${{ matrix.dir }}/Dockerfile
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha,scope=${{ matrix.name }}
          cache-to: type=gha,mode=max,scope=${{ matrix.name }}
```

### Design decisions

**Dynamic matrix via discovery job**: The `discover` job reads `functions/*/handler.json` and outputs a JSON matrix. This means adding a new function only requires creating `functions/<name>/handler.json` — no workflow changes needed.

**`matrix.dir` vs `matrix.name`**: The directory name (e.g., `send-email`) may differ from the handler.json `name` field (e.g., `knative-job-example` vs dir `example`). We pass both:
- `matrix.dir` — used for `--only=` flag and Dockerfile path (generate.ts filters by directory name)
- `matrix.name` — used for image naming (from handler.json `name` field)

**No QEMU/multi-platform**: Starting with `linux/amd64` only. Multi-platform can be added later if ARM64 nodes are used in production.

**Per-function cache scope**: `scope=${{ matrix.name }}` ensures each function's Docker layers are cached independently. Without scoping, functions would evict each other's cache entries since GHA has a 10GB cache limit per repo.

**Generate before build**: The workflow runs `generate.ts --only=<dir>` to create the Dockerfile. This only needs Node.js, not pnpm or full dependencies, because generate.ts uses only Node builtins (`fs`, `path`).

## Verification

1. **PR test**: Create a PR that adds this workflow. GitHub Actions should show:
   - `Discover functions` job finds all 3 functions
   - 3 parallel `Build <name>-fn` jobs
   - Each builds successfully but does NOT push (PR event)

2. **Push test**: Merge to main. Verify:
   - Images appear at `ghcr.io/<owner>/send-email-fn:latest`
   - Images appear at `ghcr.io/<owner>/send-verification-link-fn:latest`
   - Short SHA tags are applied

3. **New function test**: Add a new `functions/test-fn/handler.json` and verify it appears as a 4th matrix job automatically.

4. **Manual trigger**: Use `workflow_dispatch` to trigger a build + push manually.
