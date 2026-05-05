# @constructive-io/fn-cli

Thin command-line wrapper around `@constructive-io/fn-client`. Exposes the `fn` executable.

## Install

```bash
pnpm add -D @constructive-io/fn-cli
pnpm add @constructive-io/fn-runtime  # for handlers
```

## Commands

```bash
fn generate [--only=<name>] [--packages-only]
fn build [--only=<name>]
fn dev [--only=<name>]
fn manifest
fn verify
fn help
```

Common flags: `--root=<dir>`, `--config=<file>`.

This wave (Wave 3) ships `generate`, `build`, `dev`, `manifest`, and `verify`. `init`, `dockerfile`, and `k8s` (standalone manifest emission) land in Waves 4–5.
