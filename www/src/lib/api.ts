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
  created_at: string;
  updated_at: string;
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

export const api = {
  getStatus: () => fetchJSON<PlatformStatus>('/api/status'),
  getFunctions: () => fetchJSON<PlatformFunction[]>('/api/functions'),
  getJobs: () => fetchJSON<Job[]>('/api/jobs'),
  getInvocations: () => fetchJSON<Invocation[]>('/api/invocations'),
  getSecrets: () => fetchJSON<PlatformSecret[]>('/api/secrets'),
  getNamespaces: () => fetchJSON<PlatformNamespace[]>('/api/namespaces'),

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
};
