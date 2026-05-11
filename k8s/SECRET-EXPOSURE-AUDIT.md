# K8s Secret Exposure Audit

Date: 2026-05-05

This audit treats all remote-reachable Git history as exposed, including
`origin/main`, feature branches, and archive branches. Values below are redacted
by default; use local Git history only if an operator needs an exact value for
rotation.

## Findings

| Severity | Credential / value class | Redacted value | Locations | First seen | Assessment |
| --- | --- | --- | --- | --- | --- |
| High | AWS IAM access key ID for Route53 DNS-01 | `AKIA6Q...JBVH` | `k8s/overlays/dev/ingress-issuer.yaml`, generated `k8s/manifests/interweb-dev.yaml` | `ff08ccc` | Real-looking AWS access key ID. The paired secret access key was not found in the targeted remote-history scan, but the IAM access key should still be revoked or rotated. |
| Medium | Route53 hosted zone ID | `Z0038...Y1JN` | `k8s/overlays/dev/ingress-issuer.yaml`, generated `k8s/manifests/interweb-dev.yaml`, `k8s/Makefile` | `ff08ccc` | Infrastructure identifier, not a credential by itself. Treat as sensitive metadata. |
| Medium | Postgres superuser/default password | `post...` reusable default | generated `k8s/manifests/*.yaml`, local overlay `pg-secret.yaml`, pgAdmin server config | `ff08ccc` | Reusable default. Rotate any non-throwaway cluster that used it. |
| Medium | pgAdmin default password | `adm...` reusable defaults | generated `k8s/manifests/*.yaml`, local pgAdmin Secret | `ff08ccc` | Reusable admin password. Rotate anywhere deployed outside a disposable local cluster. |
| Low | Local MinIO/S3 credentials | known MinIO local default | generated local/CI manifests, local MinIO and upload Secret manifests | `ff08ccc` | Known local default. Low severity unless reused against shared infrastructure. |
| Low | Mailgun placeholder values | placeholder mailgun values | generated local/CI manifests, local mailgun Secret manifests | `ff08ccc` | Placeholder, not a real-looking Mailgun key. |
| Low | Staging backup AWS placeholders | `<replace-me>` | generated `k8s/manifests/interweb-staging.yaml` | `ff08ccc` | Placeholder only. No real backup key found in tracked source. |
| Informational | Deleted function secret references | secret names only: GHCR, OpenAI, Calvin, Stripe | historical `k8s/base/functions/*.yaml` removed by `93aa2ad` | `a0ed5aa` | Secret names and env var names were exposed, but targeted scans did not find literal GHCR/OpenAI/Calvin/Stripe token values in those manifests. |

## Verification Performed

- Searched current k8s manifests, overlays, scripts, workflows, Docker Compose,
  and generated-manifest paths for secret keywords and credential patterns.
- Searched remote-reachable history with targeted patterns for AWS access keys,
  AWS secret keys, Mailgun keys, Postgres/pgAdmin passwords, GitHub tokens,
  OpenAI-style keys, Stripe-style keys, Slack tokens, and private key headers.
- Inspected deleted k8s function manifests that referenced external credentials.
- Ran Gitleaks against Git history. It reported 474 redacted findings, all for
  the same AWS access key ID pattern repeated across
  `k8s/overlays/dev/ingress-issuer.yaml` and generated
  `k8s/manifests/interweb-dev.yaml` in reachable commits.
- Ran Gitleaks against the current working tree after remediation; no current
  leaks were found.

## Remediation Applied

- Removed tracked rendered manifests under `k8s/manifests/*.yaml`.
- Added `k8s/manifests/*.yaml` to `.gitignore`.
- Replaced tracked k8s Secret values with explicit `REPLACE_WITH_*`
  placeholders.
- Removed the pgAdmin preconfigured database password from tracked ConfigMaps.
- Replaced the hardcoded Route53 access key ID and hosted zone ID with
  placeholders.
- Updated local MinIO deployments to read access keys from the upload Secret
  instead of duplicating literal default credentials.
- Removed the staging backup Secret from Kustomize resources so real backup
  credentials must be created out-of-band.

## Required Follow-Up

- Revoke or rotate the IAM access key whose ID appears as `AKIA6Q...JBVH`.
- Rotate Postgres and pgAdmin credentials on any cluster that used the committed
  defaults outside throwaway local development.
- Keep real Kubernetes Secrets out of Git. Use a secret manager, ExternalSecrets,
  SOPS, or explicit operator-created `kubectl create secret` workflows.
- If a public or broadly shared remote already received these commits, consider
  repository history rewrite only after rotating exposed credentials. History
  rewriting alone does not make leaked credentials safe.
