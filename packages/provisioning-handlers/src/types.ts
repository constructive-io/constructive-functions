/**
 * Provisioning Handlers — shared types.
 *
 * Following express-context/module-loader conventions:
 *   - Typed row interfaces for every SQL query
 *   - Generic handler type (typed input/output per handler)
 *   - Context carries shared cached instances (no per-call allocations)
 */

import type { ModuleLoader } from '@constructive-io/module-loader';
import type { Pool } from 'pg';

// ── Context ──────────────────────────────────────────────────────────────────

export interface ProvisioningContext {
  pool: Pool;
  databaseId: string;
  /** Shared module loader instance (TTL-cached, do NOT allocate per-call) */
  loader: ModuleLoader;
}

// ── Handler ──────────────────────────────────────────────────────────────────

export type ProvisioningHandler<
  P = Record<string, unknown>,
  R = Record<string, unknown>,
> = (payload: P, context: ProvisioningContext) => Promise<R>;

// ── DB Row Interfaces ────────────────────────────────────────────────────────

export interface NamespaceRow {
  id: string;
  name: string;
}

export interface SecretRow {
  key: string;
  decrypted_value: string;
}

export interface FunctionDefinitionRow {
  id: string;
  name: string;
  task_identifier: string;
  service_url: string | null;
  runtime: string | null;
  image: string | null;
  concurrency: number;
  scale_min: number;
  scale_max: number;
  scale_target: number;
  timeout_seconds: number;
  resources: Record<string, unknown>;
  namespace_id: string | null;
}

// ── Handler-specific payload/result types ────────────────────────────────────

export interface SyncSecretsPayload {
  id?: string;
  namespace_name?: string;
}

export interface SyncSecretsResult {
  synced?: boolean;
  skipped?: boolean;
  reason?: string;
  secretCount?: number;
}

export interface SyncResourcesPayload {
  id: string;
}

export interface SyncResourcesResult {
  synced?: boolean;
  skipped?: boolean;
  reason?: string;
  name?: string;
  serviceUrl?: string | null;
}
