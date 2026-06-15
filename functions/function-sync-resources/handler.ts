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
 * Resolves all declared resources for the function's scope,
 * validates they exist, and logs warnings for missing resources.
 *
 * In later phases this will actually reconcile resource bindings,
 * ensure bucket policies are configured, and validate model access.
 */
const handler: FunctionHandler<FunctionSyncResourcesPayload> = async (params, context) => {
  const { log, env } = context;
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

  log.info('function-sync-resources: starting', {
    function_id,
    name,
    namespace_name,
    secrets: required_secrets?.length ?? 0,
    configs: required_configs?.length ?? 0,
    buckets: required_buckets?.length ?? 0,
    models: required_models?.length ?? 0,
  });

  const warnings: string[] = [];
  let resolvedCount = 0;

  // Check secrets — already injected into env by the compute worker
  if (required_secrets) {
    for (const secret of required_secrets) {
      if (env[secret.name]) {
        resolvedCount++;
      } else if (secret.required) {
        warnings.push(`missing required secret: ${secret.name}`);
      } else {
        log.info(`optional secret not present: ${secret.name}`);
      }
    }
  }

  // Check configs — also in env
  if (required_configs) {
    for (const config of required_configs) {
      if (env[config.name]) {
        resolvedCount++;
      } else if (config.required) {
        warnings.push(`missing required config: ${config.name}`);
      } else {
        log.info(`optional config not present: ${config.name}`);
      }
    }
  }

  // Check buckets — phase 1 stub: just validate the names are declared
  if (required_buckets) {
    for (const bucket of required_buckets) {
      // In later phases we'd verify the bucket exists in S3/MinIO
      log.info(`declared bucket: ${bucket} (validation deferred to phase 2)`);
      resolvedCount++;
    }
  }

  // Check models — phase 1 stub: just validate the names are declared
  if (required_models) {
    for (const model of required_models) {
      // In later phases we'd verify model access via the agentic server
      log.info(`declared model: ${model} (validation deferred to phase 2)`);
      resolvedCount++;
    }
  }

  if (warnings.length > 0) {
    log.warn('function-sync-resources: missing resources', {
      function_id,
      name,
      warnings,
    });
  }

  log.info('function-sync-resources: complete', {
    function_id,
    resolved: resolvedCount,
    warnings: warnings.length,
  });

  return {
    status: warnings.length > 0 ? 'warnings' : 'ok',
    resolved_count: resolvedCount,
    warnings,
  };
};

export default handler;
