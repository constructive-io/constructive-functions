# TypeScript Style & Modularity Audit — PR #108 (Provisioning Handlers)

## Verdict: Not up to par with express-context / module-loader patterns

The provisioning-handlers package works correctly and the architecture (seed + sync, isolated K8s dep) is sound. But the TypeScript quality is below the standard set by `express-context/loaders`, `module-loader`, and the compute-worker's existing code. The core issues are **weak typing** and **missing modularity abstractions**.

---

## 1. `Record<string, unknown>` everywhere — no domain types

**The problem:**
```typescript
// knative.ts
export function buildKnativeServiceSpec(
  fnRow: Record<string, unknown>,   // ← what IS this?
  namespaceName: string
): KnativeServiceSpec {
  const fnName = fnRow.name as string;
  const image = fnRow.image as string;
  const concurrency = (fnRow.concurrency as number) ?? 0;
  // ... 22 casts from Record<string, unknown>
```

Every handler and the seed function pass `Record<string, unknown>` for DB rows, then immediately cast every field with `as string` / `as number`. This is the exact anti-pattern the AGENTS.md calls out — "Do not use Any, getattr, setattr, or other lazy ways to access attributes."

**What express-context does instead:**
```typescript
// loaders/rls.ts — typed row interface
interface RlsSettingsRow {
  authenticate: string;
  authenticate_strict: string;
  authenticate_schema: string;
  // ...
}

const result = await servicesPool.query<RlsSettingsRow>(SQL, [databaseId]);
const row = result.rows[0]; // fully typed, no casts
```

**What module-loader does:**
```typescript
// compute-loader.ts — typed result via generic
const fnResult = await this.pool.query(FUNCTION_MODULE_SQL, [databaseId]);
const row = fnResult.rows[0]; // fields typed by column mapping
functionModule = {
  publicSchema: row.public_schema,     // no `as string` needed
  privateSchema: row.private_schema,
};
```

**Fix:** Define a `FunctionDefinitionRow` interface (it already exists as `PlatformFunctionDefinition` in the worker types!) and use `pool.query<FunctionDefinitionRow>()`. The `buildKnativeServiceSpec` signature becomes:

```typescript
export function buildKnativeServiceSpec(
  fn: Pick<PlatformFunctionDefinition, 'name' | 'image' | 'concurrency' | 'scale_min' | 'scale_max' | 'timeout_seconds' | 'resources'>,
  namespaceName: string
): KnativeServiceSpec
```

Zero `as` casts. Compile-time safety. Self-documenting.

---

## 2. No row-type interfaces for SQL queries

**The problem:** The seed and handlers run raw SQL but never type the result:
```typescript
// seed.ts
const { rows: namespaceRows } = await pool.query(nsQuery, nsParams);
for (const ns of namespaceRows) {
  const nsName = ns.name as string;  // ← any
  const nsId = ns.id as string;      // ← any
```

**What the established pattern is:**
```typescript
// billing.ts (express-context)
interface BillingModuleRow {
  public_schema: string;
  private_schema: string;
  record_usage_function: string;
}
const result = await tenantPool.query<BillingModuleRow>(SQL, [databaseId]);
```

**Fix:** Add row interfaces for every SQL query:
```typescript
interface NamespaceRow { id: string; name: string; }
interface SecretRow { key: string; decrypted_value: string; }
```

---

## 3. `ProvisioningHandler` type is too loose

**Current:**
```typescript
export type ProvisioningHandler = (
  payload: Record<string, unknown>,
  context: ProvisioningContext
) => Promise<Record<string, unknown>>;
```

Both input AND output are untyped bags. Compare to the express-context loaders:
```typescript
export interface ModuleLoader<T = unknown> {
  resolve(ctx: LoaderContext): Promise<T | undefined>;
}
```

The loader system is generic — each loader declares its output type (`ModuleLoader<RlsModule>`, `ModuleLoader<LlmConfig>`). The provisioning handlers should do the same:

```typescript
// Typed per-handler
export interface SyncSecretsPayload { id?: string; namespace_name?: string; }
export interface SyncSecretsResult { synced: boolean; secretCount?: number; skipped?: boolean; reason?: string; }

export type ProvisioningHandler<P = unknown, R = unknown> = (
  payload: P,
  context: ProvisioningContext
) => Promise<R>;
```

---

## 4. K8s client factory reads `process.env` directly

**Current (`k8s-client.ts`):**
```typescript
export function getK8sClient(): InterwebClient | null {
  const apiUrl = process.env.K8S_API_URL;
  if (!apiUrl) return null;
  return new InterwebClient({ restEndpoint: apiUrl, ... });
}
```

**What AGENTS.md says:**
> Always use the unified environment configuration system — never read `process.env` directly for config values.

The `@pgpmjs/env` `getEnvOptions()` pattern exists for this. Even if provisioning-handlers doesn't need the full pgpm config stack, the function should accept the URL as a parameter (dependency injection) rather than reading the environment directly. The `bin/provision.ts` CLI is the only place that should touch `process.env`.

**Fix:**
```typescript
export function createK8sClient(apiUrl: string): InterwebClient { ... }
export function getK8sClientFromEnv(): InterwebClient | null {
  const url = process.env.K8S_API_URL;
  return url ? createK8sClient(url) : null;
}
```

This also makes the client testable without environment manipulation.

---

## 5. No `createModuleLoader` / factory pattern

The express-context loader system is deeply composable:
```typescript
export const llmLoader = createModuleLoader<LlmConfig>({
  name: 'llm',
  ttlMs: 5 * 60_000,
  async resolve(ctx) { ... }
});
```

Each loader gets:
- Its own LRU cache (keyed by databaseId)
- Named logging
- Invalidation
- A uniform interface (`ModuleLoader<T>`)

The provisioning registry is a flat `Map<string, ProvisioningHandler>` with no caching, no loader abstraction, and handlers that instantiate `new ComputeModuleLoader(pool)` on every single invocation:

```typescript
// function-sync-resources.ts — creates a new loader EVERY call
const loader = new ComputeModuleLoader(pool);
const config = await loader.load(databaseId);
```

The `ComputeModuleLoader` has internal TTL caching, but creating a new instance on every handler invocation defeats that cache completely. The worker already has `this.loader` — it should be passed through the context.

**Fix:** Add `loader: ComputeModuleLoader` to `ProvisioningContext`:
```typescript
export interface ProvisioningContext {
  pool: Pool;
  databaseId: string;
  loader: ComputeModuleLoader;  // shared, cached instance
}
```

---

## 6. `mergeAndReplace` leaks abstraction across modules

`mergeAndReplace` is defined in `seed.ts` but imported by `handlers/function-sync-resources.ts`:
```typescript
import { mergeAndReplace } from '../seed';
```

A handler shouldn't import from the seed. This is a shared K8s operation utility — it should live in `k8s-client.ts` or a dedicated `k8s-ops.ts` file alongside `getK8sClient`, `isConflict`, `isNotFound`.

---

## 7. Error type guards use `as Record<string, unknown>`

```typescript
// k8s-client.ts
export function isConflict(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as Record<string, unknown>;
  return e.status === 409 || e.statusCode === 409 || ...;
}
```

This is fine for a quick utility, but compare to how the rest of the codebase handles errors — with typed error interfaces or discriminated unions. At minimum, define:

```typescript
interface K8sApiError {
  status?: number;
  statusCode?: number;
  message?: string;
}
function isK8sError(err: unknown): err is K8sApiError { ... }
```

---

## 8. Seed function is a 170-line monolith

`provision()` in `seed.ts` is one giant function that:
1. Queries namespaces → creates K8s namespaces
2. Queries secrets → creates K8s secrets
3. Resolves module config → queries functions → creates Knative Services → writes back URLs

Compare to the express-context pattern where each concern is a separate loader with its own file, cache, and type. The seed should be decomposed:

```typescript
// seed.ts — orchestrator
export async function provision(opts: ProvisionSeedOptions): Promise<ProvisionSeedResult> {
  const client = getK8sClient();
  if (!client) return emptyResult();

  const nsResults = await provisionNamespaces(client, opts);
  const secretResults = await syncNamespaceSecrets(client, opts);
  const fnResults = await provisionFunctions(client, opts);

  return { namespaces: nsResults, secrets: secretResults, functions: fnResults };
}
```

Each step gets its own function (ideally its own file), making the code testable in isolation.

---

## 9. CLI entry point (`bin/provision.ts`) — hand-rolled arg parsing

The CLI uses a hand-rolled `parseArgs` function. The rest of the constructive ecosystem uses `@pgpmjs/cli` or `inquirerer` for argument parsing with type safety and help generation. Minor issue, but if this tool grows, it'll need proper CLI infrastructure.

---

## 10. Missing JSDoc / interface contracts

Express-context types have rich documentation:
```typescript
/**
 * Resolve a per-database module on demand (lazy, cached).
 * Only fires the SQL query on the first call per databaseId per TTL window.
 */
useModule: { ... }
```

Provisioning-handlers has good file-level doc comments but the exported interfaces (`ProvisioningContext`, `ProvisioningHandler`, `ProvisionSeedOptions`) have minimal or no JSDoc on individual fields.

---

## Summary Table

| Dimension | express-context / module-loader | provisioning-handlers | Gap |
|-----------|-------------------------------|----------------------|-----|
| DB query typing | `query<TypedRow>()` — zero casts | `query()` + `as string` everywhere | **High** |
| Function signatures | Typed inputs/outputs | `Record<string, unknown>` both ways | **High** |
| Environment config | `getEnvOptions()` / DI | Raw `process.env` reads | **Medium** |
| Loader/cache reuse | `createModuleLoader` factory, shared instances | New instance per call (defeats cache) | **High** |
| Error types | Typed error interfaces | `as Record<string, unknown>` guards | **Low** |
| Decomposition | One concern per file/loader | 170-line monolith seed | **Medium** |
| Shared utilities | Proper module boundaries | Handler imports from seed | **Medium** |

---

## Recommended Refactor Priority

1. **Type the DB rows** — biggest bang for buck. Define interfaces, use `query<T>()`, eliminate `as` casts.
2. **Pass `ComputeModuleLoader` through context** — stop creating new instances per call.
3. **Move `mergeAndReplace` to `k8s-ops.ts`** — proper module boundary.
4. **Make `buildKnativeServiceSpec` accept a typed input** — use `Pick<PlatformFunctionDefinition, ...>`.
5. **Decompose `provision()`** into step functions.
6. **DI for K8s client** — accept URL as param, keep env reads at the edge (CLI).

None of these require architectural changes — they're all TypeScript hygiene that brings the code in line with how `express-context` and `module-loader` are written.
