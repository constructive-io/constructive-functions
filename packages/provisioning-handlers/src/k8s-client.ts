/**
 * K8s client factory — encapsulates environment-based configuration.
 * Returns null when K8S_API_URL is not set (dev mode).
 */

import { InterwebClient } from '@kubernetesjs/ops';

export function getK8sClient(): InterwebClient | null {
  const apiUrl = process.env.K8S_API_URL;
  if (!apiUrl) return null;

  return new InterwebClient({
    restEndpoint: apiUrl,
    kubeconfig: '',
    namespace: 'default',
    context: '',
  });
}

/**
 * Check if error is a 409 Conflict (resource already exists).
 */
export function isConflict(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as Record<string, unknown>;
  return e.status === 409
    || e.statusCode === 409
    || String(e.message ?? '').includes('AlreadyExists');
}

/**
 * Check if error is a 404 Not Found.
 */
export function isNotFound(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as Record<string, unknown>;
  return e.status === 404
    || e.statusCode === 404
    || String(e.message ?? '').includes('NotFound');
}
