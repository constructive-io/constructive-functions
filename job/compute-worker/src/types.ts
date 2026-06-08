import type { Pool } from 'pg';

// ─── Platform Function Definition ────────────────────────────────────────────

export interface FunctionRequirement {
  name: string;
  required: boolean;
}

export interface PlatformFunctionDefinition {
  id: string;
  name: string;
  task_identifier: string;
  service_url: string | null;
  is_invocable: boolean;
  is_built_in: boolean;
  max_attempts: number | null;
  priority: number | null;
  queue_name: string | null;
  scope: string | null;
  namespace_id: string | null;
  required_configs: FunctionRequirement[] | null;
  required_secrets: FunctionRequirement[] | null;
  description: string | null;
}

// ─── Invocation Record ───────────────────────────────────────────────────────

export type InvocationStatus = 'running' | 'completed' | 'failed';

export interface CreateInvocationInput {
  function_id: string;
  task_identifier: string;
  payload: unknown;
  job_id: string | number;
  database_id?: string;
  actor_id?: string;
}

export interface InvocationRecord {
  id: string;
  function_id: string;
  task_identifier: string;
  status: InvocationStatus;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  payload: unknown;
  result: unknown;
  error: string | null;
}

// ─── Job Row ─────────────────────────────────────────────────────────────────

export interface ComputeJobRow {
  id: number | string;
  task_identifier: string;
  payload?: unknown;
  database_id?: string;
  actor_id?: string;
  entity_id?: string;
}

// ─── Worker Options ──────────────────────────────────────────────────────────

export interface ComputeWorkerOptions {
  pgPool: Pool;
  idleDelay?: number;
  workerId?: string;
  cacheTtlMs?: number;
}
