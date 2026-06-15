# Provisioning Handlers vs. Operator & Hub — Comparison Analysis

## 1. Knative Version Mismatch

| Source | Knative Version |
|--------|----------------|
| **constructive-cloud** `01-install-operators.sh` | **v1.20.0** |
| **constructive-cloud** `99-cleanup.sh` (old references) | v1.15.0 |
| **Our provisioning E2E workflow** | **v1.17.0** |

**Verdict:** We should bump to **v1.20.0** to match what constructive-cloud actually installs. The v1.17.0 works fine in CI, but aligning versions avoids subtle API/behavior drift.

---

## 2. Knative Service Spec — Side-by-Side

### What the operator builds (`resources/knative.go`):

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: send-verification-link
  namespace: constructive
  labels:
    app.kubernetes.io/managed-by: interweb-operator
    app.kubernetes.io/part-of: constructive
    app.kubernetes.io/component: function
    app.kubernetes.io/name: send-verification-link
    app.kubernetes.io/instance: constructive-send-verification-link
    networking.knative.dev/visibility: cluster-local    # ← visibility label
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "1"
        autoscaling.knative.dev/maxScale: "10"
        autoscaling.knative.dev/target: "50"            # ← target annotation
    spec:
      containerConcurrency: 10
      timeoutSeconds: 300
      imagePullSecrets: [...]                           # ← from app.spec.imagePullSecrets
      containers:
        - image: ghcr.io/constructive-io/send-verification-link-fn:dad7293
          command: [...]                                # ← optional
          args: [...]                                   # ← optional
          ports:
            - containerPort: 8080
          env:                                          # ← sorted plain values + secretKeyRef
            - name: GRAPHQL_URL
              value: "http://constructive-private-server.constructive.svc.cluster.local:3000/graphql"
            - name: MAILGUN_API_KEY
              valueFrom:
                secretKeyRef: { name: mailgun-credentials, key: MAILGUN_API_KEY }
          resources: { requests: {...}, limits: {...} }
          volumeMounts:
            - name: tmp
              mountPath: /tmp
      volumes:
        - name: tmp
          emptyDir: {}
```

### What our provisioning handler builds (`knative.ts`):

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: hello-provisioned
  namespace: test-ns
  # ← NO labels at all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "1"
        autoscaling.knative.dev/maxScale: "10"
        # ← NO autoscaling target
    spec:
      containerConcurrency: 10
      timeoutSeconds: 300
      # ← NO imagePullSecrets
      containers:
        - image: ghcr.io/knative/helloworld-go:latest
          envFrom:                                      # ← bulk secretRef, not individual keys
            - secretRef: { name: test-ns-secrets }
          # ← NO ports
          # ← NO command/args
          # ← NO volumeMounts
          # ← NO resources (unless DB has them)
      # ← NO volumes
```

### Key Gaps in Our Builder

| Feature | Operator | Our Handler | Impact |
|---------|----------|-------------|--------|
| **Labels** | Full k8s standard labels + `networking.knative.dev/visibility` | None | Functions won't be `cluster-local` by default. No standard labels for `kubectl` filtering |
| **`autoscaling.knative.dev/target`** | Yes (from `scaling.target`) | Missing | No concurrency-based autoscaling target |
| **`containerPort`** | Explicit (default 8080) | Missing | Knative infers it, but explicit is better practice |
| **`imagePullSecrets`** | From `app.spec.imagePullSecrets` | Missing | Private registry images (ghcr.io) will fail with `ImagePullBackOff` |
| **Env wiring** | Individual `env` entries + `secretKeyRef` per key | Bulk `envFrom` with `secretRef` | Our approach loads ALL keys from the secret. Operator cherry-picks specific keys via `secretKeyRef` |
| **`command`/`args`** | Supported | Missing | Can't customize entrypoint |
| **`/tmp` volume** | Always mounts `emptyDir` at `/tmp` | Missing | Some containers need writable `/tmp` (read-only rootfs) |
| **Resources** | Always specified | Only if DB `resources` column is populated | Knative may reject or use defaults |
| **Server auto-wiring** | `FunctionEnvFromServer()` injects `GRAPHQL_URL` + `META_GRAPHQL_URL` | Not applicable (no server concept) | Functions can't auto-discover their GraphQL endpoint |
| **`traffic`** | Not set (Knative defaults to 100% latest) | Not set | Same — OK |
| **Apply strategy** | Server-Side Apply (`client.Patch` with `ForceOwnership`) | Create + catch 409 → GET → Replace | SSA is idempotent by design; our create/replace requires manual metadata merging |

---

## 3. Apply Strategy: SSA vs. Create/Replace

This is the biggest architectural difference.

**Operator uses Server-Side Apply (SSA):**
```go
c.Patch(ctx, obj, client.Apply, client.FieldOwner("interweb-operator"), client.ForceOwnership)
```
- One call handles both create and update
- No need to fetch `resourceVersion` or merge annotations
- Ownership tracking prevents field conflicts between managers
- Knative webhook doesn't reject because SSA preserves existing fields

**Our handler uses Create + Replace:**
```typescript
try {
  await client.createServingKnativeDevV1NamespacedService(...)
} catch (err) {
  if (isConflict(err)) {
    const existing = await client.readServingKnativeDevV1NamespacedService(...)
    // Manual merge of resourceVersion + annotations + labels
    await client.replaceServingKnativeDevV1NamespacedService(...)
  }
}
```
- 3 API calls on update (create fails → get → replace) vs. 1 for SSA
- Had to manually handle immutable annotations (`serving.knative.dev/creator`)
- Fragile: any new immutable field Knative adds will break us

**Recommendation:** Check if `@kubernetesjs/ops` supports SSA (PATCH with `application/apply-patch+yaml`). If so, switch to it. This would eliminate the entire GET→merge→replace dance and match the operator's approach.

---

## 4. Hub Config Pattern — Dual-Mode Functions

The hub YAML shows how functions run **without K8s** in local/CI:

```yaml
# Hub local config
functions:
  - name: send-verification-link
    type: function
    provider: local              # ← runs as a Node.js process, no K8s
    host: 0.0.0.0
    ports:
      http: 8082
    env:
      GRAPHQL_URL: "http://localhost:3002/graphql"
```

```yaml
# Operator CI config
functions:
  - name: send-verification-link
    image: ghcr.io/constructive-io/send-verification-link-fn:dad7293
    port: 8080
    visibility: cluster-local    # ← Knative ksvc in K8s
    scaling:
      minScale: 1
      maxScale: 10
```

**The hub's model is exactly what our provisioning handlers' "dev mode" should emulate:**
- When `K8S_API_URL` is unset → function runs as a local process (like hub's `provider: local`)
- When `K8S_API_URL` is set → function is provisioned as a Knative Service (like the operator CR)

Our current dev mode just returns `{ skipped: true }`, which is correct for the provisioning layer. The hub's config-driven orchestration is a separate concern handled by the hub's `pnpm start`.

**Observation:** The hub's `constructive.ci.yaml` has `functions: []` (disabled in CI). The hub's `constructive.functions-ci.yaml` runs functions via `provider: local` (direct Node.js process). Neither uses Knative in CI. Only the operator's `test-k8s-deployment.yaml` actually deploys Knative Services in CI — and that's the Go operator, not TypeScript.

**Our provisioning E2E is the first TypeScript-driven Knative deployment tested in CI across all three repos.**

---

## 5. ConstructiveApp CRD vs. Our DB-Driven Model

The operator defines everything declaratively in a single `ConstructiveApp` CR:

```yaml
spec:
  databases: [...]
  migrations: [...]
  servers: [...]
  functions: [...]
  dashboards: [...]
  config: { ... }
  secrets: { definitions: [...] }
```

Our provisioning handlers read from **the database** instead:
- `metaschema_public.namespace` → K8s Namespace
- `metaschema_public.namespace_secret` → K8s Secret
- `constructive_compute_public.platform_function_definitions` → Knative Service

**These are complementary, not competing.** The operator manages the entire application stack (DB, servers, dashboards, functions) as a single declarative unit. Our provisioning handlers manage just the function infrastructure, driven by DB state. They could coexist:

- Operator manages the application-level Knative Services (like `send-verification-link`) that are part of the platform
- Provisioning handlers manage tenant/dynamic functions registered through the platform's UI/API

---

## 6. Summary of Recommended Changes

### Must Fix (version alignment):
1. **Bump Knative version to v1.20.0** in the E2E workflow to match constructive-cloud

### Should Fix (spec parity with operator):
2. **Add standard labels** to ksvc metadata: `app.kubernetes.io/name`, `app.kubernetes.io/component: function`, `app.kubernetes.io/part-of`, `app.kubernetes.io/managed-by: provisioning-handlers`
3. **Add `networking.knative.dev/visibility: cluster-local` label** (default, matching all existing function definitions)
4. **Add `containerPort: 8080`** to container spec (explicit > implicit)
5. **Add `/tmp` emptyDir volume + volumeMount** (matches operator and base template)
6. **Add `autoscaling.knative.dev/target`** from a DB column (or default to 50)

### Should Investigate:
7. **Server-Side Apply** via `@kubernetesjs/ops` — would eliminate the fragile create/GET/replace dance
8. **`imagePullSecrets`** — needed for private registry images. Could be stored in namespace_secret or a dedicated column
9. **Individual `secretKeyRef` vs. bulk `envFrom`** — operator cherry-picks keys; our bulk approach loads everything. Consider if this matters for security/clarity

### Design Alignment (future):
10. **Port/command/args support** in `platform_function_definitions` schema — the operator supports these but our DB schema doesn't have them yet
11. **Server auto-wiring** — the operator auto-resolves `GRAPHQL_URL` from a server reference. Our functions don't have this concept yet but may need it
