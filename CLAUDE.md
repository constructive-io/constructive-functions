# Constructive Functions

Serverless function workloads (simple-email, send-email-link) with a job queue system deployed via Kubernetes.

## Project Structure

- `functions/` — Function source code (handler.ts + handler.json manifests)
- `generated/` — Auto-generated workspace packages from templates (do not edit directly)
- `templates/node-graphql/` — Shared function template
- `packages/fn-runtime/`, `packages/fn-app/` — Function runtime libraries
- `job/service/` — Job orchestration service (worker + scheduler)
- `k8s/overlays/local-simple/` — Plain k8s manifests for local dev (no Knative)
- `k8s/overlays/local/` — Knative-based local dev manifests
- `tests/e2e/` — End-to-end tests against live k8s stack

## Build

```bash
pnpm generate        # Generate workspace packages from handler.json manifests
pnpm install         # Install dependencies
pnpm build           # Build all packages
```

## Testing

### Unit tests

```bash
pnpm test:unit       # functions/*/__tests__/
```

### Integration tests

```bash
pnpm test:integration  # tests/integration/ — isolated component tests
```

### E2E tests (requires running k8s stack)

Requires Skaffold running (`make skaffold-dev`) or equivalent with port-forwards active.

```bash
# With default credentials (postgres/postgres123! on localhost:5432)
pnpm test:e2e

# With explicit env vars
PGHOST=localhost PGPORT=5432 PGUSER=postgres PGPASSWORD='postgres123!' PGDATABASE=constructive pnpm test:e2e
```

E2E tests insert jobs into `app_jobs.jobs` via SQL and verify the job service picks them up and the functions process them.

## GHCR Authentication

Private images on `ghcr.io/constructive-io/` require a GitHub PAT with `read:packages` scope.

**Docker login:**
```bash
echo $GH_PAT_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

**K8s pull secret** (required for Skaffold dev):
```bash
kubectl create namespace constructive-functions --dry-run=client -o yaml | kubectl apply -f -
kubectl create secret docker-registry ghcr-pull \
  --docker-server=ghcr.io \
  --docker-username=YOUR_USERNAME \
  --docker-password=YOUR_GH_PAT_TOKEN \
  --docker-email=your@email.com \
  -n constructive-functions
kubectl patch serviceaccount default -n constructive-functions \
  -p '{"imagePullSecrets": [{"name": "ghcr-pull"}]}'
```

## Local K8s Development (Skaffold)

### Start the stack

```bash
make skaffold-dev    # skaffold dev -p local-simple
```

This builds the `constructive-functions` image, deploys everything to the `constructive-functions` namespace, and sets up port-forwards + hot reload.

### Hot reload

Edit `functions/<name>/handler.ts` → Skaffold syncs the file into the container → `tsx --watch` restarts the process (~2-5s).

### Port map (Skaffold)

| Service | Local Port |
|---------|------------|
| PostgreSQL | 5432 |
| Job Service | 8080 |
| simple-email | 8081 |
| send-email-link | 8082 |

## Debugging K8s Pods

### Check pod status

```bash
kubectl get pods -n constructive-functions
```

All pods should show `Running` (except `constructive-db` which should be `Completed`).

### View logs

```bash
# Job service logs (job pickup, dispatch, errors)
kubectl logs -n constructive-functions -l app=knative-job-service -f

# Function logs
kubectl logs -n constructive-functions -l app=simple-email -f
kubectl logs -n constructive-functions -l app=send-email-link -f

# Constructive server logs
kubectl logs -n constructive-functions -l app=constructive-server -f

# DB setup job logs (ran once at deploy time)
kubectl logs -n constructive-functions -l job-name=constructive-db
```

### Check events (image pull failures, scheduling issues)

```bash
kubectl get events -n constructive-functions --sort-by='.lastTimestamp'
kubectl describe pod <pod-name> -n constructive-functions
```

### Port-forward manually (if Skaffold isn't managing them)

```bash
kubectl port-forward -n constructive-functions svc/postgres 5432:5432
kubectl port-forward -n constructive-functions svc/knative-job-service 8080:8080
kubectl port-forward -n constructive-functions svc/simple-email 8081:80
kubectl port-forward -n constructive-functions svc/send-email-link 8082:80
kubectl port-forward -n constructive-functions svc/constructive-server 3002:3000
```

### Exec into a pod

```bash
kubectl exec -it -n constructive-functions deploy/simple-email -- sh
kubectl exec -it -n constructive-functions deploy/knative-job-service -- sh
```

### Query the database directly

```bash
kubectl exec -it -n constructive-functions deploy/postgres -- psql -U postgres -d constructive
```

Useful queries:

```sql
-- Check pending jobs
SELECT id, task_identifier, attempts, locked_by, last_error FROM app_jobs.jobs ORDER BY id;

-- Check database record (needed for job insertion)
SELECT id, name FROM metaschema_public.database;

-- Manually insert a test job
SELECT * FROM app_jobs.add_job(
  (SELECT id FROM metaschema_public.database LIMIT 1),
  'simple-email'::text,
  '{"to":"test@example.com","subject":"test","html":"<p>hello</p>"}'::json
);
```

### Restart a deployment

```bash
kubectl rollout restart -n constructive-functions deploy/knative-job-service
kubectl rollout restart -n constructive-functions deploy/simple-email
```

### GHCR pull secret

If pods show `ImagePullBackOff` for `ghcr.io` images, the namespace needs a pull secret:

```bash
kubectl create secret docker-registry ghcr-pull \
  --docker-server=ghcr.io \
  --docker-username=<username> \
  --docker-password=<PAT> \
  --docker-email=<email> \
  -n constructive-functions

kubectl patch serviceaccount default -n constructive-functions \
  -p '{"imagePullSecrets": [{"name": "ghcr-pull"}]}'
```

## Lint

```bash
pnpm lint
```
