/**
 * Shared types for all module loaders.
 */

import type { Pool } from 'pg';

// ─── Compute Module ──────────────────────────────────────────────────────────

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

// ─── Usage Module ────────────────────────────────────────────────────────────

export interface UsageTableConfig {
  invocationsSchema: string;
  invocationsTable: string;
  computeUsageSchema: string;
  computeUsageTable: string;
  inferenceUsageSchema: string;
  inferenceUsageTable: string;
  storageUsageSchema: string;
  storageUsageTable: string;
}

// ─── Billing Module ──────────────────────────────────────────────────────────

export interface BillingModuleConfig {
  publicSchema: string;
  privateSchema: string;
  recordUsageFunction: string;
}

// ─── Graph Execution Module ──────────────────────────────────────────────────

export interface GraphExecutionModuleConfig {
  publicSchema: string;
  privateSchema: string;
  nodeStatesTable: string;
  completeNodeFunction: string;
  failNodeFunction: string;
}

// ─── Metering Entry Types ────────────────────────────────────────────────────

export interface MeterEntry {
  jobId: number | string;
  taskIdentifier: string;
  databaseId?: string;
  actorId?: string;
  entityId?: string;
  durationMs: number;
  status: 'ok' | 'error';
  error?: string;
  payload?: unknown;
  result?: unknown;
  graphExecutionId?: string;
  nodeName?: string;
  dispatchType: 'inline' | 'http';
}

export interface InferenceEntry {
  databaseId?: string;
  entityId?: string;
  actorId?: string;
  requestId?: string;
  model: string;
  provider: string;
  service: 'chat' | 'embed';
  operation: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  latencyMs: number;
  status: 'ok' | 'error';
  errorType?: string;
  rawUsage?: unknown;
}

export interface StorageEntry {
  databaseId?: string;
  entityId?: string;
  actorId?: string;
  operation: 'read' | 'write' | 'delete';
  bucket: string;
  key: string;
  sizeBytes: number;
  durationMs: number;
}

// ─── Loader Options ──────────────────────────────────────────────────────────

export interface ModuleLoaderOptions {
  pool: Pool;
  /** Default database_id for lookups (platform = 00000000-...) */
  databaseId?: string;
  /** Cache TTL in ms (default 60s) */
  cacheTtlMs?: number;
}

export const DEFAULT_DATABASE_ID = '00000000-0000-0000-0000-000000000000';
export const DEFAULT_TTL_MS = 60_000;
