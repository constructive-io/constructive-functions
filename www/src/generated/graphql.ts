/**
 * GraphQL operations for the Constructive Platform UI.
 *
 * These queries target the constructive_infra_public and app_jobs schemas
 * exposed by the Constructive GraphQL server on port 3002.
 *
 * Regenerate with: pnpm codegen (or make codegen)
 */

// ─── Fragments ──────────────────────────────────────────────────────────────

export const PLATFORM_FUNCTION_FIELDS = /* GraphQL */ `
  fragment PlatformFunctionFields on PlatformFunctionDefinition {
    name
    taskIdentifier
    serviceUrl
    isInvocable
    isBuiltIn
    scope
    description
    requiredSecrets
    requiredConfigs
    namespaceId
    createdAt
    updatedAt
  }
`;

export const PLATFORM_SECRET_FIELDS = /* GraphQL */ `
  fragment PlatformSecretFields on PlatformSecretDefinition {
    name
    description
    isBuiltIn
    databaseId
    createdAt
    updatedAt
  }
`;

export const PLATFORM_NAMESPACE_FIELDS = /* GraphQL */ `
  fragment PlatformNamespaceFields on PlatformNamespace {
    id
    name
    namespaceName
    description
    isActive
    createdAt
    updatedAt
  }
`;

export const JOB_FIELDS = /* GraphQL */ `
  fragment JobFields on Job {
    id
    taskIdentifier
    payload
    priority
    attempts
    maxAttempts
    lockedBy
    lockedAt
    lastError
    createdAt
    updatedAt
  }
`;

export const INVOCATION_FIELDS = /* GraphQL */ `
  fragment InvocationFields on PlatformFunctionInvocation {
    id
    functionName
    jobId
    workerId
    status
    startedAt
    completedAt
    durationMs
    errorMessage
    createdAt
  }
`;

// ─── Queries ────────────────────────────────────────────────────────────────

export const ALL_PLATFORM_FUNCTIONS = /* GraphQL */ `
  query AllPlatformFunctions {
    allPlatformFunctionDefinitions(orderBy: NAME_ASC) {
      nodes {
        ...PlatformFunctionFields
      }
    }
  }
  ${PLATFORM_FUNCTION_FIELDS}
`;

export const ALL_PLATFORM_SECRETS = /* GraphQL */ `
  query AllPlatformSecrets {
    allPlatformSecretDefinitions(orderBy: NAME_ASC) {
      nodes {
        ...PlatformSecretFields
      }
    }
  }
  ${PLATFORM_SECRET_FIELDS}
`;

export const ALL_PLATFORM_NAMESPACES = /* GraphQL */ `
  query AllPlatformNamespaces {
    allPlatformNamespaces(orderBy: NAME_ASC) {
      nodes {
        ...PlatformNamespaceFields
      }
    }
  }
  ${PLATFORM_NAMESPACE_FIELDS}
`;

export const ALL_JOBS = /* GraphQL */ `
  query AllJobs {
    allJobs(orderBy: ID_DESC, first: 50) {
      nodes {
        ...JobFields
      }
    }
  }
  ${JOB_FIELDS}
`;

export const ALL_INVOCATIONS = /* GraphQL */ `
  query AllInvocations {
    allPlatformFunctionInvocations(orderBy: CREATED_AT_DESC, first: 50) {
      nodes {
        ...InvocationFields
      }
    }
  }
  ${INVOCATION_FIELDS}
`;

// ─── Mutations ──────────────────────────────────────────────────────────────

export const CREATE_JOB = /* GraphQL */ `
  mutation CreateJob($input: CreateJobInput!) {
    createJob(input: $input) {
      job {
        ...JobFields
      }
    }
  }
  ${JOB_FIELDS}
`;
