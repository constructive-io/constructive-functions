import type { FunctionHandler } from '@constructive-io/fn-runtime';

type SecretRequirement = {
  name: string;
  required: boolean;
};

type FunctionProvisionPayload = {
  function_id: string;
  name?: string;
  service_url?: string;
  namespace_name?: string;
  required_secrets?: SecretRequirement[];
  database_id?: string;
};

/**
 * Phase 1 stub: function-provision
 *
 * Receives a function definition from the job payload, validates
 * service_url exists or generates a gateway URL, and if required_secrets
 * is non-empty, validates those secrets exist in the function's namespace.
 *
 * In later phases this will actually deploy the function, configure
 * Knative services, set up ingress routes, etc.
 */
const handler: FunctionHandler<FunctionProvisionPayload> = async (params, context) => {
  const { log, env } = context;
  const {
    function_id,
    name,
    service_url,
    namespace_name,
    required_secrets,
  } = params;

  if (!function_id) {
    throw new Error('function_id is required');
  }

  log.info('function-provision: starting', {
    function_id,
    name,
    namespace_name,
    has_service_url: Boolean(service_url),
    required_secrets_count: required_secrets?.length ?? 0,
  });

  // Step 1: Validate or generate service_url
  let resolvedUrl = service_url;
  if (!resolvedUrl) {
    const gatewayUrl = env.COMPUTE_GATEWAY_URL || env.INTERNAL_GATEWAY_URL;
    if (gatewayUrl && name) {
      resolvedUrl = `${gatewayUrl.replace(/\/$/, '')}/${name}`;
      log.info('function-provision: generated gateway URL', { resolvedUrl });
    } else {
      log.warn('function-provision: no service_url and no gateway configured');
    }
  }

  // Step 2: Validate required secrets exist (by checking env — after secret injection)
  const missingSecrets: string[] = [];
  if (required_secrets && required_secrets.length > 0) {
    for (const secret of required_secrets) {
      if (secret.required && !env[secret.name]) {
        missingSecrets.push(secret.name);
      }
    }

    if (missingSecrets.length > 0) {
      log.warn('function-provision: missing required secrets', {
        function_id,
        name,
        namespace_name,
        missing: missingSecrets,
      });
    } else {
      log.info('function-provision: all required secrets present', {
        function_id,
        count: required_secrets.filter(s => s.required).length,
      });
    }
  }

  return {
    status: missingSecrets.length > 0 ? 'missing_secrets' : 'provisioned',
    service_url: resolvedUrl ?? null,
    missing_secrets: missingSecrets,
  };
};

export default handler;
