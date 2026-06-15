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
 * Validates the incoming function definition payload and logs the
 * provisioning request. Later phases will deploy the function to Knative,
 * reconcile K8s secrets from the config_secrets_module, and configure
 * ingress routes.
 */
const handler: FunctionHandler<FunctionProvisionPayload> = async (params, context) => {
  const { log } = context;
  const { function_id, name, service_url, namespace_name, required_secrets } = params;

  if (!function_id) {
    throw new Error('function_id is required');
  }

  log.info('function-provision: validated', {
    function_id,
    name: name ?? null,
    has_service_url: Boolean(service_url),
    namespace_name: namespace_name ?? null,
    required_secrets_count: required_secrets?.length ?? 0,
  });

  return {
    status: 'validated',
    function_id,
    service_url: service_url ?? null,
  };
};

export default handler;
