-- Deploy: partitions/create_default_partitions
-- made with <3 @ constructive.io

-- In the monolith, partitions are created at runtime by metaschema triggers
-- during database provisioning. In standalone mode we create default partitions
-- so that inserts work without the metaschema provisioning layer.

BEGIN;

CREATE TABLE IF NOT EXISTS constructive_compute_public.platform_function_invocations_default
  PARTITION OF constructive_compute_public.platform_function_invocations DEFAULT;

CREATE TABLE IF NOT EXISTS constructive_compute_public.platform_function_execution_logs_default
  PARTITION OF constructive_compute_public.platform_function_execution_logs DEFAULT;

CREATE TABLE IF NOT EXISTS constructive_compute_public.org_function_invocations_default
  PARTITION OF constructive_compute_public.org_function_invocations DEFAULT;

CREATE TABLE IF NOT EXISTS constructive_compute_public.org_function_execution_logs_default
  PARTITION OF constructive_compute_public.org_function_execution_logs DEFAULT;

CREATE TABLE IF NOT EXISTS constructive_infra_public.platform_namespace_events_default
  PARTITION OF constructive_infra_public.platform_namespace_events DEFAULT;

-- FBP module partitioned tables (now in constructive_compute_private after schema consolidation)
CREATE TABLE IF NOT EXISTS constructive_compute_private.platform_function_graph_executions_default
  PARTITION OF constructive_compute_private.platform_function_graph_executions DEFAULT;

CREATE TABLE IF NOT EXISTS constructive_compute_private.platform_function_graph_execution_outputs_default
  PARTITION OF constructive_compute_private.platform_function_graph_execution_outputs DEFAULT;

-- Compute usage logging (partitioned by completed_at)
CREATE TABLE IF NOT EXISTS constructive_compute_public.platform_compute_log_default
  PARTITION OF constructive_compute_public.platform_compute_log DEFAULT;

COMMIT;
