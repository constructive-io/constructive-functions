/**
 * TypeScript types generated from the Constructive GraphQL schema.
 *
 * These map to tables in constructive_infra_public and app_jobs schemas.
 * Regenerate with: pnpm codegen (or make codegen)
 */

export interface PlatformFunctionDefinition {
  name: string;
  taskIdentifier: string;
  serviceUrl: string;
  isInvocable: boolean;
  isBuiltIn: boolean;
  scope: string;
  description: string;
  requiredSecrets: string;
  requiredConfigs: string;
  namespaceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformSecretDefinition {
  name: string;
  description: string;
  isBuiltIn: boolean;
  databaseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformNamespace {
  id: string;
  name: string;
  namespaceName: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  taskIdentifier: string;
  payload: Record<string, unknown>;
  priority: number;
  attempts: number;
  maxAttempts: number;
  lockedBy: string | null;
  lockedAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformFunctionInvocation {
  id: string;
  functionName: string;
  jobId: string;
  workerId: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  errorMessage: string | null;
  createdAt: string;
}

// ─── Connection types ────────────────────────────────────────────────────────

export interface Connection<T> {
  nodes: T[];
}

export interface AllPlatformFunctionsData {
  allPlatformFunctionDefinitions: Connection<PlatformFunctionDefinition>;
}

export interface AllPlatformSecretsData {
  allPlatformSecretDefinitions: Connection<PlatformSecretDefinition>;
}

export interface AllPlatformNamespacesData {
  allPlatformNamespaces: Connection<PlatformNamespace>;
}

export interface AllJobsData {
  allJobs: Connection<Job>;
}

export interface AllInvocationsData {
  allPlatformFunctionInvocations: Connection<PlatformFunctionInvocation>;
}

export interface CreateJobData {
  createJob: { job: Job };
}

export interface CreateJobInput {
  job: {
    taskIdentifier: string;
    payload: Record<string, unknown>;
  };
}
