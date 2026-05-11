# WS4: Environment Variable Handling

**Branch**: `feat/env-handling`
**Dependencies**: None — can start immediately
**Estimated files**: 4 modified, per-function `.env.example` auto-generated

## Context

### Current env var usage

Functions read `process.env` directly and use `parseEnvBoolean()` from `@pgpmjs/env`:

**send-email** (`functions/send-email/handler.ts` lines 30-31):
```typescript
const isDryRun = parseEnvBoolean(process.env.SEND_EMAIL_DRY_RUN) ?? false;
const useSmtp = parseEnvBoolean(process.env.EMAIL_SEND_USE_SMTP) ?? false;
```
Also reads: `process.env.SMTP_FROM`, `process.env.MAILGUN_FROM` (lines 45-50).

**send-verification-link** (`functions/send-verification-link/handler.ts` lines 73-74):
```typescript
const isDryRun = parseEnvBoolean(env.SEND_VERIFICATION_LINK_DRY_RUN) ?? false;
const useSmtp = parseEnvBoolean(env.EMAIL_SEND_USE_SMTP) ?? false;
```
Also reads: `env.GRAPHQL_URL` (via fn-runtime), `env.LOCAL_APP_PORT` (line 152).

**fn-runtime** (`packages/fn-runtime/src/context.ts` line 15):
```typescript
const env = process.env as Record<string, string | undefined>;
```
Passes `process.env` as `context.env` to all handlers.

**fn-runtime** (`packages/fn-runtime/src/graphql.ts` lines 48-51):
```typescript
const graphqlUrl = env.GRAPHQL_URL;
if (!graphqlUrl) throw new Error('Missing required environment variable GRAPHQL_URL');
```

### `@pgpmjs/env` library

Located at `constructive/pgpm/env/src/`. Key exports:
- `parseEnvBoolean(value)` — parses `true/1/yes` → `true`, `false/0/no` → `false`, undefined → undefined
- `parseEnvNumber(value)` — parses string to number
- `getEnvVars()` — parses all PGPM-specific env vars into typed options

This library implements 12-factor app principles. It is NOT called "12-factor-env" — it's `@pgpmjs/env`.

### K8s env injection

K8s manifests inject env vars via:
1. `configMapRef` — non-secret config (database host, API URLs)
2. `secretRef` — secrets (pg-credentials, mailgun-credentials)
3. Explicit `env` entries — function-specific overrides

Example from `k8s/base/functions/send-email.yaml`:
```yaml
envFrom:
  - secretRef:
      name: mailgun-credentials
env:
  - name: NODE_ENV
    value: "production"
  - name: LOG_LEVEL
    value: "debug"
  - name: MAILGUN_FROM
    value: "no-reply@mg.constructive.io"
```

### Problems with current approach
1. No central list of what env vars a function needs
2. No validation on startup — functions fail at request time if vars are missing
3. No `.env.example` files for developer onboarding
4. K8s manifests can miss required vars with no warning

## Requirements

1. Declare env vars in `handler.json` via an `env` field
2. Generator produces `.env.example` per function in `generated/<name>/`
3. Generator injects startup validation for `required: true` vars into generated `index.ts`
4. Env declarations are metadata only — runtime parsing stays in handler.ts via `@pgpmjs/env`
5. Schema supports: type, required, default, description, secret (for future K8s manifest generation)

## Implementation

### 1. Extend `FunctionManifest` in `scripts/generate.ts`

Add to the existing interface (currently at line 18):

```typescript
interface EnvVarDeclaration {
  type: 'string' | 'boolean' | 'number';
  required?: boolean;
  default?: string;
  description?: string;
  secret?: boolean;
}

interface FunctionManifest {
  name: string;
  version: string;
  description?: string;
  type?: string;
  dependencies?: Record<string, string>;
  env?: Record<string, EnvVarDeclaration>;    // NEW
}
```

### 2. Update handler.json files

#### `functions/send-email/handler.json`

```json
{
  "name": "send-email",
  "version": "1.1.0",
  "type": "node-graphql",
  "description": "Simple Knative email function that sends emails directly from job payload",
  "dependencies": {
    "@constructive-io/postmaster": "^1.1.0",
    "@pgpmjs/env": "^2.11.0",
    "@pgpmjs/logger": "^2.1.0",
    "simple-smtp-server": "^0.3.0"
  },
  "env": {
    "SEND_EMAIL_DRY_RUN": {
      "type": "boolean",
      "default": "false",
      "description": "Skip actual email sending (log only)"
    },
    "EMAIL_SEND_USE_SMTP": {
      "type": "boolean",
      "default": "false",
      "description": "Use SMTP transport instead of Mailgun/Postmaster"
    },
    "SMTP_FROM": {
      "type": "string",
      "description": "Sender email address when using SMTP transport"
    },
    "SMTP_HOST": {
      "type": "string",
      "description": "SMTP server hostname",
      "secret": true
    },
    "SMTP_PORT": {
      "type": "number",
      "default": "587",
      "description": "SMTP server port"
    },
    "SMTP_USER": {
      "type": "string",
      "description": "SMTP authentication username",
      "secret": true
    },
    "SMTP_PASS": {
      "type": "string",
      "description": "SMTP authentication password",
      "secret": true
    },
    "MAILGUN_FROM": {
      "type": "string",
      "description": "Sender email address when using Mailgun/Postmaster"
    }
  }
}
```

#### `functions/send-verification-link/handler.json`

```json
{
  "name": "send-verification-link",
  "version": "1.1.0",
  "type": "node-graphql",
  "description": "Sends invite, password reset, and verification emails",
  "dependencies": {
    "@constructive-io/postmaster": "^1.1.0",
    "@launchql/mjml": "0.1.1",
    "@launchql/styled-email": "0.1.0",
    "@pgpmjs/env": "^2.11.0",
    "@pgpmjs/logger": "^2.1.0",
    "graphql-request": "^7.1.2",
    "graphql-tag": "^2.12.6",
    "simple-smtp-server": "^0.3.0"
  },
  "env": {
    "SEND_VERIFICATION_LINK_DRY_RUN": {
      "type": "boolean",
      "default": "false",
      "description": "Skip actual email sending (log only)"
    },
    "EMAIL_SEND_USE_SMTP": {
      "type": "boolean",
      "default": "false",
      "description": "Use SMTP transport instead of Mailgun/Postmaster"
    },
    "GRAPHQL_URL": {
      "type": "string",
      "required": true,
      "description": "Base URL for tenant GraphQL queries"
    },
    "META_GRAPHQL_URL": {
      "type": "string",
      "description": "URL for meta-schema GraphQL queries (defaults to GRAPHQL_URL)"
    },
    "GRAPHQL_AUTH_TOKEN": {
      "type": "string",
      "description": "Bearer token for GraphQL authentication",
      "secret": true
    },
    "GRAPHQL_HOST_HEADER": {
      "type": "string",
      "description": "Custom Host header for GraphQL requests"
    },
    "DEFAULT_DATABASE_ID": {
      "type": "string",
      "description": "Fallback database ID when X-Database-Id header is missing"
    },
    "LOCAL_APP_PORT": {
      "type": "string",
      "description": "Port appended to localhost URLs in dry-run mode"
    },
    "SMTP_FROM": {
      "type": "string",
      "description": "Sender email address when using SMTP transport"
    },
    "MAILGUN_FROM": {
      "type": "string",
      "description": "Sender email address when using Mailgun/Postmaster"
    }
  }
}
```

#### `functions/example/handler.json`

```json
{
  "name": "knative-job-example",
  "version": "1.1.0",
  "type": "node-graphql",
  "description": "Example Knative job function",
  "env": {}
}
```

### 3. Add `generateEnvExample()` to `scripts/generate.ts`

Add after the existing `processTemplateFile()` function:

```typescript
function generateEnvExample(genDir: string, manifest: FunctionManifest): void {
  if (!manifest.env || Object.keys(manifest.env).length === 0) return;

  const lines: string[] = [
    `# Environment variables for ${manifest.name}`,
    `# Generated from handler.json — do not edit directly`,
    ''
  ];

  for (const [key, decl] of Object.entries(manifest.env)) {
    if (decl.description) {
      lines.push(`# ${decl.description}`);
    }
    if (decl.required) {
      lines.push(`# REQUIRED`);
    }
    if (decl.secret) {
      lines.push(`# (secret — use K8s Secret, not ConfigMap)`);
    }
    const value = decl.default || '';
    lines.push(`${key}=${value}`);
    lines.push('');
  }

  writeIfChanged(path.join(genDir, '.env.example'), lines.join('\n'));
}
```

### 4. Add env validation injection to `processTemplateFile()`

Modify the `processTemplateFile()` function to inject startup validation for `required: true` env vars when processing `index.ts`:

```typescript
function processTemplateFile(
  fileName: string,
  templateContent: string,
  manifest: FunctionManifest,
  fnDir: string
): string {
  switch (fileName) {
    case 'package.json':
      return processPackageJson(templateContent, manifest);
    case 'tsconfig.json':
      return processTsconfig(templateContent, fnDir);
    case 'index.ts': {
      const processed = replacePlaceholders(templateContent, manifest);
      return injectEnvValidation(processed, manifest);
    }
    default:
      return replacePlaceholders(templateContent, manifest);
  }
}

function injectEnvValidation(content: string, manifest: FunctionManifest): string {
  if (!manifest.env) return content;

  const requiredVars = Object.entries(manifest.env)
    .filter(([_, decl]) => decl.required)
    .map(([key]) => key);

  if (requiredVars.length === 0) return content;

  const validation = [
    '// --- Auto-generated env validation ---',
    `const _requiredEnv = ${JSON.stringify(requiredVars)};`,
    `const _missingEnv = _requiredEnv.filter(k => !process.env[k]);`,
    `if (_missingEnv.length > 0) {`,
    `  throw new Error('Missing required environment variables for ${manifest.name}: ' + _missingEnv.join(', '));`,
    `}`,
    '// --- End env validation ---',
    ''
  ].join('\n');

  return validation + content;
}
```

### 5. Call `generateEnvExample()` in the main loop

In `main()`, after the template file processing loop, add:

```typescript
    // Generate .env.example from env declarations
    generateEnvExample(genDir, manifest);
```

### Generated output example

For `send-email`, `generated/send-email/.env.example`:

```
# Environment variables for send-email
# Generated from handler.json — do not edit directly

# Skip actual email sending (log only)
SEND_EMAIL_DRY_RUN=false

# Use SMTP transport instead of Mailgun/Postmaster
EMAIL_SEND_USE_SMTP=false

# Sender email address when using SMTP transport
SMTP_FROM=

# SMTP server hostname
# (secret — use K8s Secret, not ConfigMap)
SMTP_HOST=

# SMTP server port
SMTP_PORT=587

# SMTP authentication username
# (secret — use K8s Secret, not ConfigMap)
SMTP_USER=

# SMTP authentication password
# (secret — use K8s Secret, not ConfigMap)
SMTP_PASS=

# Sender email address when using Mailgun/Postmaster
MAILGUN_FROM=
```

For `send-verification-link`, the generated `index.ts` would start with:

```typescript
// --- Auto-generated env validation ---
const _requiredEnv = ["GRAPHQL_URL"];
const _missingEnv = _requiredEnv.filter(k => !process.env[k]);
if (_missingEnv.length > 0) {
  throw new Error('Missing required environment variables for send-verification-link: ' + _missingEnv.join(', '));
}
// --- End env validation ---
import { createFunctionServer } from '@constructive-io/fn-runtime';
import handler from './handler';
// ...
```

### Relationship to `@pgpmjs/env`

The `env` declarations in `handler.json` are **metadata only**:
- They document what env vars a function uses
- They drive `.env.example` generation and startup validation
- They do NOT replace runtime parsing in handler.ts

Runtime parsing continues to use:
- `parseEnvBoolean()` from `@pgpmjs/env` — already imported in handler files
- Direct `process.env` / `context.env` access

No new dependencies on `@pgpmjs/env` are introduced. The two systems are complementary:
- `handler.json.env` = declaration ("what vars exist")
- `@pgpmjs/env` in handler.ts = parsing ("how vars are interpreted at runtime")

### Future: K8s manifest generation from env declarations

With the `secret` field on env declarations, a future generator could produce:
- ConfigMap template for non-secret vars
- Secret template for `secret: true` vars
- Kustomize patches that inject them into Knative services

This is NOT part of the current workstream but the schema supports it.

## Files Summary

| Action | File |
|--------|------|
| Modify | `scripts/generate.ts` — add `EnvVarDeclaration` interface, update `FunctionManifest`, add `generateEnvExample()`, add `injectEnvValidation()`, update `processTemplateFile()` for index.ts |
| Modify | `functions/send-email/handler.json` — add `env` field |
| Modify | `functions/send-verification-link/handler.json` — add `env` field |
| Modify | `functions/example/handler.json` — add `env: {}` |
| Generated | `generated/send-email/.env.example` |
| Generated | `generated/send-verification-link/.env.example` |

## Verification

```bash
# 1. Generate with env declarations
rm -rf generated/
pnpm generate

# 2. Check .env.example files
cat generated/send-email/.env.example
# Should list all env vars with descriptions and defaults

cat generated/send-verification-link/.env.example
# Should include GRAPHQL_URL marked as REQUIRED

# 3. Check env validation injection
head -10 generated/send-verification-link/index.ts
# Should start with _requiredEnv validation block

head -5 generated/send-email/index.ts
# Should NOT have validation block (no required vars)

head -5 generated/example/index.ts
# Should NOT have validation block (empty env)

# 4. Full build
pnpm install
pnpm build
# All packages should compile (validation code is valid TypeScript)

# 5. Test validation at runtime
GRAPHQL_URL="" node generated/send-verification-link/dist/index.js
# Should throw: "Missing required environment variables for send-verification-link: GRAPHQL_URL"

GRAPHQL_URL=http://localhost:3000 PORT=9999 node generated/send-verification-link/dist/index.js
# Should start without error (Ctrl+C to stop)
```
