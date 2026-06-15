import type { FunctionHandler } from '@constructive-io/fn-runtime';

type ResourceRequirement = {
  name: string;
  required: boolean;
};

type FunctionSyncResourcesPayload = {
  function_id: string;
  name?: string;
  namespace_name?: string;
  required_secrets?: ResourceRequirement[];
  required_configs?: ResourceRequirement[];
  required_buckets?: string[];
  required_models?: string[];
  database_id?: string;
};

/**
 * Phase 1 stub: function-sync-resources
 *
 * Validates the incoming resource declarations and logs a summary.
 * Later phases will reconcile K8s secrets, verify bucket existence,
 * check model access, and report drift.
 */
const handler: FunctionHandler<FunctionSyncResourcesPayload> = async (params, context) => {
  const { log } = context;
  const {
    function_id,
    name,
    namespace_name,
    required_secrets,
    required_configs,
    required_buckets,
    required_models,
  } = params;

  if (!function_id) {
    throw new Error('function_id is required');
  }

  const declared = {
    secrets: required_secrets?.length ?? 0,
    configs: required_configs?.length ?? 0,
    buckets: required_buckets?.length ?? 0,
    models: required_models?.length ?? 0,
  };

  log.info('function-sync-resources: validated', {
    function_id,
    name: name ?? null,
    namespace_name: namespace_name ?? null,
    ...declared,
  });

  return {
    status: 'validated',
    function_id,
    declared,
  };
};

export default handler;
