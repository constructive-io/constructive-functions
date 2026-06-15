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
 * Receives a namespace row from the job payload, validates that
 * namespace_name is computed, logs the provisioning event, and
 * inserts a 'created' event into namespace_events.
 *
 * In later phases this will actually create K8s namespaces,
 * configure network policies, etc.
 */
const handler: FunctionHandler<NamespaceProvisionPayload> = async (params, context) => {
  const { log, client } = context;
  const { namespace_id, namespace_name, global_name } = params;

  if (!namespace_id || !namespace_name) {
    throw new Error('namespace_id and namespace_name are required');
  }

  log.info('namespace-provision: starting', {
    namespace_id,
    namespace_name,
    global_name,
  });

  // Validate namespace_name is a non-empty, lowercase slug
  if (!/^[a-z][a-z0-9-]*$/.test(namespace_name)) {
    throw new Error(
      `Invalid namespace_name "${namespace_name}" — must be lowercase alphanumeric with hyphens`
    );
  }

  // Phase 1: insert a 'created' event into namespace_events via GraphQL
  // This is a stub — the actual mutation will depend on the DB schema from constructive-db
  const eventType = 'created';
  try {
    await client.request(
      `mutation InsertNamespaceEvent($input: NamespaceEventInput!) {
        createNamespaceEvent(input: $input) { event { id } }
      }`,
      {
        input: {
          namespaceEvent: {
            namespaceId: namespace_id,
            eventType,
            metadata: JSON.stringify({
              namespace_name,
              global_name: global_name ?? null,
              provisioned_at: new Date().toISOString(),
            }),
          },
        },
      }
    );
    log.info('namespace-provision: event inserted', { namespace_id, eventType });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    log.warn(`namespace-provision: event insertion failed (phase 1 stub): ${msg}`);
  }

  return {
    status: 'provisioned',
    event_type: eventType,
  };
};

export default handler;
