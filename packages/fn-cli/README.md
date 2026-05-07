# @constructive-io/fn-cli

Thin command-line wrapper around `@constructive-io/fn-client`. Exposes the `fn` executable.

## Install

```bash
pnpm add -D @constructive-io/fn-cli
pnpm add @constructive-io/fn-runtime  # for handlers
```

## Commands

```bash
fn init <name> [--type=node-graphql|python] [--description=<d>] [--force] [--no-tty]
fn generate [--only=<name>] [--packages-only]
fn build [--only=<name>]
fn dev [--only=<name>]
fn manifest
fn verify
fn help
```

Common flags: `--root=<dir>`, `--config=<file>`.

### `fn init`

Scaffolds `functions/<name>/handler.{json,ts|py}` from a bundled template. Powered by [`genomic`](https://www.npmjs.com/package/genomic) — the same engine `pgpm init` uses — so prompt conventions and `--no-tty` flag-mapping match the rest of the Constructive ecosystem.

```bash
# Interactive (prompts for description)
fn init send-welcome

# Non-interactive
fn init send-welcome --no-tty --description "User welcome email"

# Python handler
fn init pyfn --type python --no-tty

# Custom functionsDir (read from fn.config.json)
fn init my-fn --no-tty   # writes to <functionsDir>/my-fn/

# Overwrite an existing dir
fn init dup --no-tty --force
```

Bundled templates live at `templates/handler/{node-graphql,python}/` inside this package. After `fn init`, run `fn generate` to stamp out the workspace package, then `fn build` to compile.
