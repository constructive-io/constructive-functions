/**
 * React Query hooks for the Constructive Platform GraphQL API.
 *
 * Generated from the constructive_infra_public and app_jobs schemas.
 * Regenerate with: pnpm codegen (or make codegen)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

import { graphqlRequest } from './client';
import {
  ALL_PLATFORM_FUNCTIONS,
  ALL_PLATFORM_SECRETS,
  ALL_PLATFORM_NAMESPACES,
  ALL_JOBS,
  ALL_INVOCATIONS,
  CREATE_JOB,
} from './graphql';
import type {
  AllPlatformFunctionsData,
  AllPlatformSecretsData,
  AllPlatformNamespacesData,
  AllJobsData,
  AllInvocationsData,
  CreateJobData,
  CreateJobInput,
  PlatformFunctionDefinition,
  PlatformSecretDefinition,
  PlatformNamespace,
  Job,
  PlatformFunctionInvocation,
} from './types';

// ─── Query key factories ────────────────────────────────────────────────────

export const platformKeys = {
  all: ['platform'] as const,
  functions: () => [...platformKeys.all, 'functions'] as const,
  secrets: () => [...platformKeys.all, 'secrets'] as const,
  namespaces: () => [...platformKeys.all, 'namespaces'] as const,
  jobs: () => [...platformKeys.all, 'jobs'] as const,
  invocations: () => [...platformKeys.all, 'invocations'] as const,
};

// ─── Query hooks ────────────────────────────────────────────────────────────

export function useAllPlatformFunctions(
  options?: Omit<UseQueryOptions<PlatformFunctionDefinition[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: platformKeys.functions(),
    queryFn: async () => {
      const data = await graphqlRequest<AllPlatformFunctionsData>(ALL_PLATFORM_FUNCTIONS);
      return data.allPlatformFunctionDefinitions.nodes;
    },
    ...options,
  });
}

export function useAllPlatformSecrets(
  options?: Omit<UseQueryOptions<PlatformSecretDefinition[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: platformKeys.secrets(),
    queryFn: async () => {
      const data = await graphqlRequest<AllPlatformSecretsData>(ALL_PLATFORM_SECRETS);
      return data.allPlatformSecretDefinitions.nodes;
    },
    ...options,
  });
}

export function useAllPlatformNamespaces(
  options?: Omit<UseQueryOptions<PlatformNamespace[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: platformKeys.namespaces(),
    queryFn: async () => {
      const data = await graphqlRequest<AllPlatformNamespacesData>(ALL_PLATFORM_NAMESPACES);
      return data.allPlatformNamespaces.nodes;
    },
    ...options,
  });
}

export function useAllJobs(
  options?: Omit<UseQueryOptions<Job[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: platformKeys.jobs(),
    queryFn: async () => {
      const data = await graphqlRequest<AllJobsData>(ALL_JOBS);
      return data.allJobs.nodes;
    },
    ...options,
  });
}

export function useAllInvocations(
  options?: Omit<UseQueryOptions<PlatformFunctionInvocation[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: platformKeys.invocations(),
    queryFn: async () => {
      const data = await graphqlRequest<AllInvocationsData>(ALL_INVOCATIONS);
      return data.allPlatformFunctionInvocations.nodes;
    },
    ...options,
  });
}

// ─── Mutation hooks ─────────────────────────────────────────────────────────

export function useCreateJob(
  options?: Omit<UseMutationOptions<Job, Error, { taskIdentifier: string; payload: Record<string, unknown> }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskIdentifier, payload }: { taskIdentifier: string; payload: Record<string, unknown> }) => {
      const input: CreateJobInput = {
        job: { taskIdentifier, payload },
      };
      const data = await graphqlRequest<CreateJobData>(CREATE_JOB, { input });
      return data.createJob.job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformKeys.jobs() });
    },
    ...options,
  });
}
