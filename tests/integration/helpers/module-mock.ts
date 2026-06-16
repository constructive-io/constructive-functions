/**
 * Shared mock helper for ModuleLoader metaschema resolution.
 *
 * When tests mock pool.query, the ModuleLoader's first call will be
 * a SELECT against metaschema_modules_public.*_module tables.
 * This helper provides realistic config rows so the loader resolves
 * correctly and the test can then assert on the subsequent INSERT/SELECT calls.
 */

/** Standard module configs returned by the mock. */
export const MODULE_CONFIGS = {
  invocation: {
    scope: 'app',
    public_schema: 'constructive_compute_public',
    invocations_table_name: 'platform_function_invocations',
    execution_logs_table_name: 'platform_execution_logs',
  },
  computeLog: {
    scope: 'app',
    public_schema: 'constructive_usage_public',
    private_schema: 'constructive_usage_private',
    compute_log_table_name: 'platform_usage_log_storage',
    usage_daily_table_name: 'platform_usage_daily',
  },
  graph: {
    scope: 'app',
    public_schema: 'constructive_compute_public',
    private_schema: 'constructive_compute_private',
    node_states_table_name: 'platform_node_states',
    complete_node_function: 'platform_complete_node',
    fail_node_function: 'platform_fail_node',
  },
  function: {
    scope: 'app',
    public_schema: 'constructive_compute_public',
    private_schema: 'constructive_compute_private',
    definitions_table_name: 'platform_function_definitions',
    secret_definitions_table_name: 'platform_function_secret_definitions',
  },
  billing: {
    scope: 'app',
    public_schema: 'constructive_billing_public',
    private_schema: 'constructive_billing_private',
    record_usage_function: 'record_usage',
  },
};

/**
 * Creates a mock query function that returns module config rows
 * for metaschema resolution queries and { rows: [] } for everything else.
 */
export function createModuleMockQuery(): jest.Mock {
  return jest.fn().mockImplementation((sql: string) => {
    if (typeof sql !== 'string') return Promise.resolve({ rows: [] });

    if (sql.includes('function_invocation_module')) {
      return Promise.resolve({ rows: [MODULE_CONFIGS.invocation] });
    }
    if (sql.includes('compute_log_module')) {
      return Promise.resolve({ rows: [MODULE_CONFIGS.computeLog] });
    }
    if (sql.includes('graph_execution_module')) {
      return Promise.resolve({ rows: [MODULE_CONFIGS.graph] });
    }
    if (sql.includes('function_module')) {
      return Promise.resolve({ rows: [MODULE_CONFIGS.function] });
    }
    if (sql.includes('billing_module')) {
      return Promise.resolve({ rows: [MODULE_CONFIGS.billing] });
    }
    return Promise.resolve({ rows: [] });
  });
}
