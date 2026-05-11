# Portable Functions Toolkit

The Constructive Functions toolkit lets any external repo `pnpm add` a small set of npm packages, drop in its own `functions/` directory, and get a full code-gen + Docker + k8s + manifest-registry pipeline — without git submodules or copy-paste.

## Package layout (Starship V2 style)

```
fn-cli ──► fn-client ──► fn-generator ──► fn-types
                  └────────────────────► fn-types
        └────────► fn-types
fn-runtime ──► fn-types         (handlers import this + fn-types)
knative-job-fn (fn-app)         (low-level Express middleware)
```

| Package | Single responsibility |
|---|---|
| `@constructive-io/fn-types` | Source-of-truth TS types: `FunctionHandler`, `FunctionContext`, `HandlerManifest`, `FnRegistry`, `FnConfig` + `defineConfig()`. No logic. |
| `@constructive-io/fn-runtime` | Express server factory + GraphQL clients + log + job-callback wiring. The contract handlers import. |
| `@constructive-io/knative-job-fn` | Low-level Express middleware for Knative job request/response shape. fn-runtime depends on it. |
| `@constructive-io/fn-generator` | Programmatic builders that emit Dockerfiles, k8s YAML, configmaps, skaffold profiles, manifest registry. Pure functions; idempotent file I/O at the boundary. |
| `@constructive-io/fn-client` | Importable `FnClient` API — config loading, manifest reading, `pnpm build`, child-process orchestration for `dev`. |
| `@constructive-io/fn-cli` | The `fn` executable. Subcommands: `init`, `generate`, `build`, `dev`, `manifest`, `verify`. |

## Quick start

```bash
# In a fresh project
pnpm add -D @constructive-io/fn-cli
pnpm add @constructive-io/fn-runtime

# Scaffold a function
pnpm fn init send-welcome --no-tty --description "Welcome email sender"
# → functions/send-welcome/{handler.json, handler.ts}

# Stamp out the workspace package, build, run
pnpm fn generate
pnpm install                           # link the just-created generated/* workspaces
pnpm fn build
pnpm fn dev                            # functions run as local Node processes
```

`fn init` uses [`genomic`](https://www.npmjs.com/package/genomic) under the hood — the same template engine `pgpm init` uses — so the prompt conventions and `--no-tty` flag-mapping match the rest of the Constructive ecosystem. Two handler types ship today: `--type=node-graphql` (default) and `--type=python`.

## Repo layout the toolkit expects

```
my-app/
├── functions/
│   └── send-welcome/
│       ├── handler.json   # {"name":"send-welcome","version":"0.1.0","type":"node-graphql"}
│       └── handler.ts     # default-exported FunctionHandler
├── fn.config.json         # FnConfig (typed via fn-types) — optional
└── package.json
```

## CLI surface

```bash
fn init <name> [--type=node-graphql|python] [--description=<d>] [--force] [--no-tty]
fn generate [--only=<name>] [--packages-only]
fn build [--only=<name>]
fn dev [--only=<name>]
fn manifest                            # print on-disk functions-manifest.json
fn verify                              # check manifest matches functions/
fn --version                           # print fn-cli version
```

Common flags: `--root=<dir>`, `--config=<file>`.

## Job-service registry (when running the `jobs-bundle` preset)

The job-service no longer hardcodes function names. It loads its registry at startup from one of three sources, in priority order:

1. `FUNCTIONS_REGISTRY` env var  
   Format: `name:moduleName:port,...` — `moduleName` and `port` are optional (missing `moduleName` falls back to `@constructive-io/<name>-fn`).

2. `FUNCTIONS_MANIFEST_PATH` env var pointing to a JSON file with the existing `functions-manifest.json` shape. Manifest entries can carry an optional `moduleName` field; otherwise convention applies.

3. Default file: `<cwd>/generated/functions-manifest.json` — what `fn generate` produces.

Empty registry is allowed; lookups still throw `Unknown function "<name>"` to preserve the legacy behaviour.

## Releasing the toolkit (Wave 5)

The CI workflow at `.github/workflows/publish.yaml` publishes all six packages with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) when a `fn-v*` tag is pushed. Steps:

1. Update versions in each `packages/fn-*/package.json` (and `packages/fn-app/package.json`). Bump in lock-step for now; we'll move to changesets later.
2. Verify locally:
   ```bash
   pnpm --filter '@constructive-io/fn-*' build
   pnpm --filter @constructive-io/fn-generator test
   pnpm --filter @constructive-io/fn-client test
   for pkg in fn-types fn-app fn-runtime fn-generator fn-client fn-cli; do
     (cd "packages/$pkg" && pnpm publish --dry-run --no-git-checks --access public)
   done
   ```
3. Tag and push:
   ```bash
   git tag fn-v0.1.0
   git push origin fn-v0.1.0
   ```
4. CI publishes in dependency order: `fn-types` → `fn-app` → `fn-runtime` → `fn-generator` → `fn-client` → `fn-cli`.

You can also run the workflow with `workflow_dispatch` (default `dry_run: true`) to verify packing before tagging.

## Verification checklist (manual, before first release)

- [ ] **Snapshot regression**: `pnpm --filter @constructive-io/fn-generator test` passes (asserts byte-identical output vs `scripts/generate.ts`).
- [ ] **Job-registry tests**: `pnpm exec jest tests/integration/job-registry.test.ts` — six cases pass.
- [ ] **Brasilia E2E**: with the live k8s stack running (`make skaffold-dev`), `pnpm test:e2e` still picks up jobs end-to-end.
- [ ] **Scratch repo**: in a fresh `/tmp/test-fn-app` repo, `pnpm add -D @constructive-io/fn-cli && pnpm add @constructive-io/fn-runtime`, add `functions/hello/handler.{json,ts}`, run `fn generate && fn build && fn manifest`. Confirm output is sensible and `docker build -f generated/hello/Dockerfile .` succeeds.
- [ ] **Hub integration**: in `constructive-hub/istanbul`, `pnpm bootstrap && pnpm start` still launches `send-verification-link` and processes a job (the hub does not yet consume the new toolkit; this confirms Wave 1-3 didn't regress the existing submodule path).

## Deferred follow-ups (not in this branch)

- **Wave 4c — replace hand-written `k8s/base/functions/*.yaml` with generator output**. The hand-written manifests carry mailgun secrets, dry-run env vars, and a different image strategy (single bundled image, args-driven entry vs per-function image with Dockerfile CMD). Migrating safely requires either teaching `KnativeServiceBuilder` to emit those fields or providing a Kustomize patch overlay. Tracked separately.
- **fn.config.ts/.js loading** — JSON only for now. Adding `.ts` requires an `esbuild`/`jiti` loader.
- **`fn init` and `fn dockerfile` / `fn k8s` standalone subcommands** — the underlying builders exist (`buildPackages`, `buildSkaffold`); these are thin CLI wrappers to add later.
- **Templates packaging** — currently `templatesDir` is a constructor option pointing at the host repo's `templates/`. A future change can ship templates inside `fn-generator` (or a separate `fn-templates` package) so customer repos don't need their own copy.
