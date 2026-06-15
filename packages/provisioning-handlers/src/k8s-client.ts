/**
 * K8s client factory and error utilities.
 *
 * Follows DI pattern: `createK8sClient(url)` is the pure factory,
 * `getK8sClientFromEnv()` reads process.env at the edge (CLI only).
 */

import { InterwebClient } from '@kubernetesjs/ops';

// ── Error type guard ─────────────────────────────────────────────────────────

interface K8sApiError {
  status?: number;
  statusCode?: number;
  message?: string;
}

function isK8sError(err: unknown): err is K8sApiError {
  return err !== null && typeof err === 'object';
}

/** Check if error is a 409 Conflict (resource already exists). */
export function isConflict(err: unknown): boolean {
  if (!isK8sError(err)) return false;
  return err.status === 409
    || err.statusCode === 409
    || (err.message ?? '').includes('AlreadyExists');
}

/** Check if error is a 404 Not Found. */
export function isNotFound(err: unknown): boolean {
  if (!isK8sError(err)) return false;
  return err.status === 404
    || err.statusCode === 404
    || (err.message ?? '').includes('NotFound');
}

// ── Client factory (DI) ──────────────────────────────────────────────────────

export function createK8sClient(apiUrl: string): InterwebClient {
  return new InterwebClient({
    restEndpoint: apiUrl,
    kubeconfig: '',
    namespace: 'default',
    context: '',
  });
}

/**
 * Convenience: read K8S_API_URL from env. Returns null in dev mode.
 * Use this only at the edge (CLI entry point, worker bootstrap).
 */
export function getK8sClient(): InterwebClient | null {
  const apiUrl = process.env.K8S_API_URL;
  if (!apiUrl) return null;
  return createK8sClient(apiUrl);
}
