# Secret Management Architecture (Constructive + Constructive‑DB)

This document describes a secret‑management model that:

- Uses **Postgres (Constructive‑DB)** to store *metadata* about secrets.
- Stores the **actual secret values** in a dedicated **secret provider** (Kubernetes Secrets, Vault, cloud secret managers, etc).
- Integrates with **Constructive server** and **job/functions** such as Knative services.

The goal is: database‑first metadata and access control, externalized secret material.

## Components

### 1. Constructive‑DB (Postgres schema)

Constructive‑DB already includes `secrets_module` and `encrypted_secrets_module` modules (see `constructive-db/packages/db_meta_snippets` and `extensions/@pgpm/meta-db-modules`). We extend this with a dedicated **secret reference** table rather than storing plaintext values.

**Proposed schema (conceptual):**

- `meta_public.secret_providers`
  - `id uuid` – provider id
  - `name text` – human name (`default-k8s`, `vault-prod`, etc.)
  - `type text` – enum-ish (`k8s`, `vault`, `aws_secrets_manager`, …)
  - `config jsonb` – provider‑specific config (e.g. namespace, vault mount, region).
- `meta_public.secrets`
  - `id uuid`
  - `app_id uuid` – FK to `meta_public.apps` (or `site_id`, `api_id` depending on context)
  - `key text` – logical secret name (`mailgun_api_key`, `stripe_secret_key`, …)
  - `provider_id uuid` – FK to `secret_providers`
  - `provider_ref text` – opaque reference understood by provider:
    - e.g. `interweb/secret-mailgun-<app-id>` for Kubernetes,
    - or `kv/data/apps/<app-id>/mailgun` for Vault.
  - `description text` – optional.
  - `created_at timestamptz`
  - `updated_at timestamptz`
  - `rotated_at timestamptz`
  - Flags: `is_active boolean`, `is_encrypted_at_rest boolean` (for compatibility with encrypted_secrets_module).

**RLS / permissions:**

- Only owners/administrators of a given `app_id` (or `site`) can:
  - Create/update/delete secrets for that app.
  - Read secret *metadata* (not values).
- System roles (e.g. `constructive_server`) can read metadata for all apps.

If desired, `encrypted_secrets_module` can still be used for “fully in‑DB encrypted secrets” as a special provider type; the above model is flexible enough to support both.

### 2. Constructive Server

Constructive server gains a **Secret Service** with a pluggable **Secret Provider** interface.

#### SecretProvider interface (conceptual)

```ts
interface SecretProvider {
  getSecret(ref: SecretRef): Promise<string>;
  setSecret(ref: SecretRef, value: string): Promise<void>;
  deleteSecret(ref: SecretRef): Promise<void>;
}

type SecretRef = {
  providerType: 'k8s' | 'vault' | 'aws_secrets_manager' | string;
  providerConfig: any;   // from meta_public.secret_providers.config
  providerRef: string;   // from meta_public.secrets.provider_ref
};
```

**Concrete implementations:**

- `KubernetesSecretProvider`:
  - Uses in‑cluster `ServiceAccount` and RBAC to call the Kubernetes API.
  - Reads/writes `v1/Secret` objects in a configured namespace.
- `VaultSecretProvider`:
  - Uses a Vault client (token/JWT auth) to read/write paths under a given mount.
- Others (AWS/GCP secrets) can be added behind the same interface.

#### SecretService responsibilities

- API surface (via GraphQL mutations / REST endpoints):
  - `createAppSecret(appId, key, value, providerId, description?)`
  - `updateAppSecret(appId, key, newValue)`
  - `rotateAppSecret(appId, key, value?)`
  - `deleteAppSecret(appId, key)`
  - `listAppSecrets(appId)` (metadata only).
- Internally:
  1. Resolve provider from `meta_public.secret_providers`.
  2. Build `SecretRef` for the given secret.
  3. Call appropriate `SecretProvider.setSecret/deleteSecret/getSecret`.
  4. Write/update rows in `meta_public.secrets` table.

The **secret values never enter the meta tables**; only references + metadata do.

### 3. Jobs / Functions (e.g. Knative)

Jobs and functions (like `simple-email`) use secrets **just‑in‑time**:

- For email functions:
  1. The job runner (e.g. `knative-job-service`) looks up the app’s `mailgun` secret metadata via API/DB.
  2. It asks `SecretService` to resolve the actual value at invocation time.
  3. It passes the secret to the worker:
     - either inline in the job payload (preferred),
     - or via short‑lived environment variables in the job pod.
  4. The worker never queries the secret provider directly; it trusts `SecretService`.

This pattern works identically whether jobs run via Knative, a queue worker, or a simple HTTP‑invoked function.

## Data Flows

### 1. Secret Creation Flow

```text
User (Dashboard) 
   │ GraphQL mutation: createAppSecret(appId, key, value, providerId)
   ▼
Constructive API
   │ 1. Auth + RLS: ensure user can manage secrets for appId
   │ 2. Load provider config from meta_public.secret_providers
   │ 3. Compute provider_ref (e.g. "interweb/app-<id>/mailgun")
   │ 4. SecretProvider.setSecret({providerType, config, providerRef}, value)
   │ 5. Insert row into meta_public.secrets (no value stored)
   ▼
Secret Provider (K8s / Vault / cloud)
   └► Persist encrypted value at provider_ref
```

### 2. Secret Usage Flow (e.g. sending email)

```text
Job Trigger (invite created) 
   ▼
knative-job-service / worker
   │ 1. Determine appId and secret key: "mailgun_api_key"
   │ 2. Query meta_public.secrets for (appId, key)
   │ 3. Build SecretRef from (provider_type, config, provider_ref)
   │ 4. SecretProvider.getSecret(SecretRef) -> value
   │ 5. Call Mailgun client with value
   ▼
Mailgun API
```

The worker only sees the plaintext secret at the moment of use. Rotation can occur independently by updating the provider value and metadata.

### 3. Secret Rotation Flow

```text
Operator or App Owner
   │ GraphQL mutation: rotateAppSecret(appId, key, newValue?)
   ▼
Constructive API
   │ 1. Lookup secret row (appId, key)
   │ 2. SecretProvider.setSecret existing provider_ref with newValue
   │ 3. Update meta_public.secrets.rotated_at, updated_at
   ▼
Secret Provider
   └► Overwrite value or create new version behind same provider_ref
```

## Kubernetes Integration Patterns

### Option A: Direct Kubernetes Secrets

**Provider type:** `k8s`

- `secret_providers.config` example:

```json
{
  "namespace": "interweb-secrets",
  "namePrefix": "secret-"
}
```

- `provider_ref` example: `"secret-app-<app-id>-mailgun"`.
- `KubernetesSecretProvider`:
  - `setSecret` → `PATCH/PUT` `v1/Secret` in `interweb-secrets` namespace with key/value.
  - `getSecret` → `GET` the `Secret` and read the value.
  - RBAC for the Constructive service account allows CRUD in this namespace only.

Pros:
- Simple and uses Kubernetes primitives.
- Secrets automatically mounted/injected to Pods if needed.

Cons:
- Secrets are still base64‑encoded and rely on cluster‑level encryption/controls.
- Rotating from outside Kubernetes is harder (though still possible).

### Option B: External Vault / OpenBao / Cloud Secret Manager

**Provider type:** `vault`, `openbao`, `aws_secrets_manager`, etc.

For this codebase we “double down” on **OpenBao** as the primary external
secret manager:

- OpenBao is an open‑source, community‑driven fork of HashiCorp Vault.
- It runs as a separate cluster (pods + storage backend) and:
  - Encrypts secrets at rest with its own key hierarchy.
  - Manages auth (Kubernetes, JWT, AppRole, etc.).
  - Exposes “secrets engines” like `kv` (static secrets) and `database` (dynamic DB creds).
  - Provides policies + audit logging around secret access.

**Provider config shape (conceptual):**

```json
{
  "vaultAddress": "https://openbao.internal",
  "mountPath": "kv/apps",
  "role": "constructive-server",           // K8s auth role
  "kubernetesAuthPath": "auth/kubernetes"  // where the K8s auth method is mounted
}
```

- `provider_ref` example: `"app-<app-id>/mailgun"`.
- The `OpenBaoSecretProvider` implementation:
  - Uses the pod’s ServiceAccount token to authenticate to OpenBao
    via the Kubernetes auth method.
  - Obtains a client token bound to the `constructive-server` role.
  - Reads/writes encrypted secrets at `"${mountPath}/${provider_ref}"`.

Pros:
- Strong separation of duties; secrets live outside both the app pods and the Postgres cluster.
- Rich rotation/versioning/audit features, plus policy‑based access control.
- Reusable across multiple clusters and services.

Cons:
- Requires running and operating an OpenBao/Vault cluster.
- Adds an extra hop (Constructive server → OpenBao → storage backend).

#### Recommended pattern

- Use **OpenBao** (or Vault) for production / high‑risk secrets:
  - Mail providers (Mailgun, SES).
  - External API keys (Stripe, OAuth clients).
  - Database passwords for external services.
- Treat Kubernetes Secrets as a **cache/transport** layer only (short‑lived, derived from OpenBao).
- Optionally use a `db_encrypted` provider backed by `@pgpm/encrypted-secrets`
  for lower‑risk or local‑only secrets.

### Option C: Hybrid through ExternalSecrets

Use an `ExternalSecrets` operator to sync Vault/Cloud secrets **into** Kubernetes Secrets and treat Kubernetes as the immediate provider for apps. Constructive writes metadata referring to the ExternalSecret names and relies on the operator to manage the external store.

## Integration in Constructive and Constructive‑DB

### In Constructive‑DB

- Add migrations (likely via new pgpm modules) that:
  - Create `meta_public.secret_providers` and `meta_public.secrets`.
  - Add RLS policies scoped to `apps`/`sites`.
- Optionally integrate with existing `secrets_module` / `encrypted_secrets_module`:
  - Introduce a provider type `db_encrypted`.
  - Migrations can map existing rows into the new metadata table with a back‑reference.

### In Constructive Server

- Add a (versioned) `SecretService` and `SecretProvider` registry in the `server` package:
  - Load provider configs at startup from `meta_public.secret_providers`.
  - Resolve providers by `provider_id` when handling mutations/queries.
- Expose GraphQL mutations:
  - `createSecret`, `updateSecret`, `deleteSecret`, `rotateSecret`, etc.
  - Read queries only expose metadata (no values).
- Update jobs / worker code paths:
  - Replace direct access to K8s secrets with calls to `SecretService.getSecret(appId, key)`.

## Summary

- **Database** (Constructive‑DB) holds authoritative metadata and access control for secrets.
- **Secret providers** (Kubernetes, Vault, cloud managers) hold encrypted values.
- **Constructive server** mediates all reads/writes via a pluggable SecretProvider abstraction.
- **Jobs and functions** obtain secrets just‑in‑time via the server, rather than hard‑wired env vars.

This pattern preserves the database‑first philosophy while avoiding raw secret storage in Postgres and keeping provider choice flexible.
