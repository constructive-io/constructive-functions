import type { Pool } from 'pg';

// ─── Platform Function Definition ────────────────────────────────────────────

export interface FunctionRequirement {
  name: string;
  required: boolean;
}

export type FunctionRuntime = 'http' | 'inline';

export interface FunctionPortDefinition {
  name: string;
  type?: string;
  description?: string;
  optional?: boolean;
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
  runtime: FunctionRuntime | null;
  inputs: FunctionPortDefinition[] | null;
  outputs: FunctionPortDefinition[] | null;
}

// ─── Compute Module Config ────────────────────────────────────────────────────

export interface FunctionModuleConfig {
  publicSchema: string;
  privateSchema: string;
  definitionsTable: string;
  secretDefinitionsTable: string;
  scope: string;
}

export interface InvocationModuleConfig {
  publicSchema: string;
  invocationsTable: string;
  executionLogsTable: string;
  scope: string;
}

export interface ComputeLogModuleConfig {
  publicSchema: string;
  privateSchema: string;
  computeLogTable: string;
  usageDailyTable: string;
  scope: string;
}

export interface ComputeModuleConfig {
  functionModule: FunctionModuleConfig | null;
  invocationModules: InvocationModuleConfig[];
  computeLogModule: ComputeLogModuleConfig | null;
}

// ─── Invocation Record ───────────────────────────────────────────────────────

export type InvocationStatus = 'running' | 'completed' | 'failed';

export interface CreateInvocationInput {
  task_identifier: string;
  payload: unknown;
  job_id: string | number;
  database_id?: string;
  actor_id?: string;
  scope?: string;
}

export interface InvocationRecord {
  id: string;
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
  organization_id?: string;
  entity_type?: string;
}

// ─── Graph Execution ─────────────────────────────────────────────────────────

/**
 * When a job is enqueued by tick_execution for a graph node,
 * its payload includes these fields alongside the node's assembled inputs.
 */
export interface GraphNodePayload {
  execution_id: string;
  node_name: string;
  node_type: string;
  inputs: Record<string, unknown>;
  props?: Array<{ name: string; type?: string; value: unknown }>;
  node_path?: string[];
}

/**
 * Type guard: does this payload represent a graph node dispatch?
 */
export function isGraphNodePayload(payload: unknown): payload is GraphNodePayload {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as Record<string, unknown>;
  return typeof p.execution_id === 'string'
    && typeof p.node_name === 'string'
    && typeof p.node_type === 'string'
    && p.inputs !== undefined;
}

// ─── Billing ──────────────────────────────────────────────────────────────────

export interface BillingModuleConfig {
  publicSchema: string;
  privateSchema: string;
  recordUsageFunction: string;
}

export interface BillingContext {
  config: BillingModuleConfig;
  entityId: string;
  meterSlug: string;
}

// ─── Worker Options ──────────────────────────────────────────────────────────

export interface ComputeWorkerOptions {
  pgPool: Pool;
  idleDelay?: number;
  workerId?: string;
  cacheTtlMs?: number;
  databaseId?: string;
}
