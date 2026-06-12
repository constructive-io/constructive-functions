const BASE = '';

export interface PlatformFunction {
  name: string;
  task_identifier: string;
  service_url: string;
  is_invocable: boolean;
  is_built_in: boolean;
  scope: string;
  description: string;
  required_secrets: Array<{ name: string; required: boolean }>;
  required_configs: Array<{ name: string; required: boolean }>;
  inputs: PortDef[];
  outputs: PortDef[];
  props: PropDef[];
  volatile: boolean;
  icon: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortDef {
  name: string;
  type: string;
  schema?: Record<string, unknown>;
  description?: string;
}

export interface PropDef {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
}

export interface NodeDefinition {
  context: string;
  name: string;
  category?: string;
  description?: string;
  inputs?: PortDef[];
  outputs?: PortDef[];
  props?: PropDef[];
}

export interface Job {
  id: string;
  task_identifier: string;
  payload: Record<string, unknown>;
  priority: number;
  attempts: number;
  max_attempts: number;
  locked_by: string | null;
  locked_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invocation {
  id: string;
  function_name: string;
  job_id: string;
  worker_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
  created_at: string;
}

export interface PlatformSecret {
  name: string;
  description: string;
  is_built_in: boolean;
  database_id: string;
  created_at: string;
  updated_at: string;
}

export interface PlatformNamespace {
  id: string;
  name: string;
  namespace_name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlatformStatus {
  database: string;
  postgres: string;
  functions: number;
  jobs: number;
  invocations: number;
}

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || res.statusText);
  }
  return res.json();
}

export interface K8sNamespace {
  metadata: { name: string; uid: string; creationTimestamp: string; labels?: Record<string, string> };
  status: { phase: string };
}

export interface K8sPod {
  metadata: { name: string; namespace: string; uid: string; creationTimestamp: string; labels?: Record<string, string> };
  status: {
    phase: string;
    containerStatuses?: Array<{
      name: string;
      image: string;
      ready: boolean;
      restartCount: number;
      state: Record<string, unknown>;
    }>;
  };
}

export interface K8sDeployment {
  metadata: { name: string; namespace: string; uid: string; creationTimestamp: string };
  spec: { replicas: number };
  status: { readyReplicas?: number; availableReplicas?: number; updatedReplicas?: number };
}

export interface K8sService {
  metadata: { name: string; namespace: string; uid: string; creationTimestamp: string };
  spec: { type: string; clusterIP: string; ports?: Array<{ port: number; targetPort: number | string; protocol: string }> };
}

export interface EnvFile {
  path: string;
  exists: boolean;
  vars: Record<string, string>;
}

export interface SecretValuesResponse {
  vars: Record<string, string>;
  rows: Array<{
    secret_name: string;
    configured_value: string | null;
    kind: 'secret' | 'config';
    created_at: string;
    updated_at: string;
  }>;
}

export interface SyncResult {
  ok: boolean;
  synced: number;
  total?: number;
}

export const api = {
  getStatus: () => fetchJSON<PlatformStatus>('/api/status'),
  getFunctions: () => fetchJSON<PlatformFunction[]>('/api/functions'),
  getDefinitions: () => fetchJSON<NodeDefinition[]>('/api/definitions'),
  getJobs: () => fetchJSON<Job[]>('/api/jobs'),
  getInvocations: () => fetchJSON<Invocation[]>('/api/invocations'),
  getSecrets: () => fetchJSON<PlatformSecret[]>('/api/secrets'),
  getNamespaces: () => fetchJSON<PlatformNamespace[]>('/api/namespaces'),

  getEnv: () => fetchJSON<EnvFile>('/api/env'),
  saveEnv: (vars: Record<string, string>) =>
    fetchJSON<{ ok: boolean; path: string; count: number }>('/api/env', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vars }),
    }),

  getSecretValues: () => fetchJSON<SecretValuesResponse>('/api/secret-values'),
  saveSecretValues: (vars: Record<string, string>) =>
    fetchJSON<{ ok: boolean; upserted: number }>('/api/secret-values', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vars }),
    }),
  syncFromDb: () =>
    fetchJSON<SyncResult>('/api/secrets/sync-from-db', { method: 'POST' }),
  syncToDb: () =>
    fetchJSON<SyncResult>('/api/secrets/sync-to-db', { method: 'POST' }),

  createJob: (task_identifier: string, payload: Record<string, unknown>) =>
    fetchJSON<Job>('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_identifier, payload }),
    }),

  runCommand: (command: string) =>
    fetchJSON<{ output: string; exitCode: number }>('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    }),

  // K8s via proxy
  k8sListNamespaces: () =>
    fetchJSON<{ items: K8sNamespace[] }>('/api/k8s/api/v1/namespaces'),
  k8sListPods: (namespace: string) =>
    fetchJSON<{ items: K8sPod[] }>(`/api/k8s/api/v1/namespaces/${namespace}/pods`),
  k8sListDeployments: (namespace: string) =>
    fetchJSON<{ items: K8sDeployment[] }>(`/api/k8s/apis/apps/v1/namespaces/${namespace}/deployments`),
  k8sListServices: (namespace: string) =>
    fetchJSON<{ items: K8sService[] }>(`/api/k8s/api/v1/namespaces/${namespace}/services`),
};
