import type { FunctionHandler } from '@constructive-io/fn-runtime';

type NamespaceProvisionPayload = {
  namespace_id: string;
  namespace_name: string;
  global_name?: string;
  database_id?: string;
};

/**
 * Phase 1 stub: namespace-provision
 *
 * Validates the incoming namespace payload and logs the provisioning request.
 * Later phases will create K8s namespaces, configure network policies,
 * and write events to the namespace_events table once the DB schema is ready.
 */
const handler: FunctionHandler<NamespaceProvisionPayload> = async (params, context) => {
  const { log } = context;
  const { namespace_id, namespace_name, global_name } = params;

  if (!namespace_id || !namespace_name) {
    throw new Error('namespace_id and namespace_name are required');
  }

  if (!/^[a-z][a-z0-9-]*$/.test(namespace_name)) {
    throw new Error(
      `Invalid namespace_name "${namespace_name}" — must be lowercase alphanumeric with hyphens`
    );
  }

  log.info('namespace-provision: validated', {
    namespace_id,
    namespace_name,
    global_name: global_name ?? null,
  });

  return {
    status: 'validated',
    namespace_id,
    namespace_name,
  };
};

export default handler;
