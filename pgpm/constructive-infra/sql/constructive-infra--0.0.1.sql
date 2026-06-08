\echo Use "CREATE EXTENSION constructive-infra" to load this file. \quit
CREATE SCHEMA constructive_infra_private;

CREATE FUNCTION constructive_infra_private.platform_namespaces_rename_proxy() RETURNS trigger AS $EOFCODE$
BEGIN
  SELECT inflection.underscore(ARRAY['constructive', NEW.name]) INTO NEW.namespace_name;
  RETURN NEW;
END;
$EOFCODE$ LANGUAGE plpgsql VOLATILE;

CREATE SCHEMA constructive_infra_public;

CREATE TABLE constructive_infra_public.platform_function_definitions ();

ALTER TABLE constructive_infra_public.platform_function_definitions 
  DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE constructive_infra_public.platform_function_definitions IS 'Function definitions — registered cloud functions with routing, queue, and retry configuration';

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ADD COLUMN created_at timestamptz;

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ADD COLUMN description text;

COMMENT ON COLUMN constructive_infra_public.platform_function_definitions.description IS 'Human-readable description of what this function does';

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ADD COLUMN id uuid;

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ALTER COLUMN id SET DEFAULT uuidv7();

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ADD COLUMN is_built_in boolean;

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ALTER COLUMN is_built_in SET NOT NULL;

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ALTER COLUMN is_built_in SET DEFAULT false;

COMMENT ON COLUMN constructive_infra_public.platform_function_definitions.is_built_in IS 'Whether this function is a built-in platform function (synced from platform) vs user-created';

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ADD COLUMN is_invocable boolean;

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ALTER COLUMN is_invocable SET NOT NULL;

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ALTER COLUMN is_invocable SET DEFAULT false;

COMMENT ON COLUMN constructive_infra_public.platform_function_definitions.is_invocable IS 'Whether this function can be called via function_invocations (public API). Default false = internal-only via add_job()';

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ADD COLUMN max_attempts int;

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ALTER COLUMN max_attempts SET NOT NULL;

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ALTER COLUMN max_attempts SET DEFAULT 25;

COMMENT ON COLUMN constructive_infra_public.platform_function_definitions.max_attempts IS 'Maximum retry attempts for the underlying job';

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ADD COLUMN name text;

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ALTER COLUMN name SET NOT NULL;

COMMENT ON COLUMN constructive_infra_public.platform_function_definitions.name IS 'Function name within scope (e.g. send_verification_link, process_file_embedding)';

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ADD COLUMN namespace_id uuid;

COMMENT ON COLUMN constructive_infra_public.platform_function_definitions.namespace_id IS 'Namespace this function belongs to (FK to namespaces table)';

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ADD COLUMN priority int;

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ALTER COLUMN priority SET NOT NULL;

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ALTER COLUMN priority SET DEFAULT 0;

COMMENT ON COLUMN constructive_infra_public.platform_function_definitions.priority IS 'Job priority (lower = higher priority)';

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ADD COLUMN queue_name text;

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ALTER COLUMN queue_name SET NOT NULL;

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ALTER COLUMN queue_name SET DEFAULT 'default';

COMMENT ON COLUMN constructive_infra_public.platform_function_definitions.queue_name IS 'Job queue name for serialization (e.g. email, ai, default)';

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ADD COLUMN scope text;

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ALTER COLUMN scope SET NOT NULL;

COMMENT ON COLUMN constructive_infra_public.platform_function_definitions.scope IS 'Function grouping scope (e.g. email, embed, chunk, custom)';

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ADD COLUMN service_url text;

COMMENT ON COLUMN constructive_infra_public.platform_function_definitions.service_url IS 'Optional service URL override for function dispatch. NULL = use gateway convention (gatewayUrl/task_identifier). Set for customer-deployed functions or external endpoints.';

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ADD COLUMN task_identifier text;

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ALTER COLUMN task_identifier SET NOT NULL;

COMMENT ON COLUMN constructive_infra_public.platform_function_definitions.task_identifier IS 'Computed routing slug: scope:name (used by Knative job worker for dispatch)';

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ADD COLUMN updated_at timestamptz;

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ALTER COLUMN updated_at SET DEFAULT now();

CREATE TABLE constructive_infra_public.platform_namespaces ();

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ADD CONSTRAINT platform_function_definitions_pkey PRIMARY KEY (id);

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ADD CONSTRAINT platform_function_definitions_scope_name_key 
    UNIQUE (scope, name);

CREATE INDEX platform_function_definitions_created_at_idx ON constructive_infra_public.platform_function_definitions (created_at);

CREATE INDEX platform_function_definitions_updated_at_idx ON constructive_infra_public.platform_function_definitions (updated_at);

CREATE TRIGGER timestamps_tg
  BEFORE INSERT OR UPDATE
  ON constructive_infra_public.platform_function_definitions
  FOR EACH ROW
  EXECUTE PROCEDURE stamps.timestamps();

CREATE TABLE constructive_infra_public.platform_function_execution_logs (
  created_at timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

ALTER TABLE constructive_infra_public.platform_function_execution_logs 
  DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE constructive_infra_public.platform_function_execution_logs IS 'Function execution logs — structured console output per invocation';

ALTER TABLE constructive_infra_public.platform_function_execution_logs 
  ADD COLUMN actor_id uuid;

COMMENT ON COLUMN constructive_infra_public.platform_function_execution_logs.actor_id IS 'User who triggered the execution (NULL for system/cron)';

COMMENT ON COLUMN constructive_infra_public.platform_function_execution_logs.created_at IS 'Log entry timestamp (partition key)';

ALTER TABLE constructive_infra_public.platform_function_execution_logs 
  ADD COLUMN database_id uuid;

ALTER TABLE constructive_infra_public.platform_function_execution_logs 
  ALTER COLUMN database_id SET NOT NULL;

COMMENT ON COLUMN constructive_infra_public.platform_function_execution_logs.database_id IS 'Database this log entry belongs to';

ALTER TABLE constructive_infra_public.platform_function_execution_logs 
  ADD COLUMN id uuid;

ALTER TABLE constructive_infra_public.platform_function_execution_logs 
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE constructive_infra_public.platform_function_execution_logs 
  ALTER COLUMN id SET DEFAULT uuidv7();

COMMENT ON COLUMN constructive_infra_public.platform_function_execution_logs.id IS 'Unique log entry identifier';

ALTER TABLE constructive_infra_public.platform_function_execution_logs 
  ADD COLUMN invocation_id uuid;

COMMENT ON COLUMN constructive_infra_public.platform_function_execution_logs.invocation_id IS 'Invocation this log entry belongs to (NULL for jobs)';

ALTER TABLE constructive_infra_public.platform_function_execution_logs 
  ADD COLUMN log_level text;

ALTER TABLE constructive_infra_public.platform_function_execution_logs 
  ALTER COLUMN log_level SET NOT NULL;

ALTER TABLE constructive_infra_public.platform_function_execution_logs 
  ALTER COLUMN log_level SET DEFAULT 'info';

COMMENT ON COLUMN constructive_infra_public.platform_function_execution_logs.log_level IS 'Log severity: debug, info, warn, error';

ALTER TABLE constructive_infra_public.platform_function_execution_logs 
  ADD CONSTRAINT platform_function_execution_logs_log_level_chk 
    CHECK (log_level IN ('debug', 'info', 'warn', 'error'));

ALTER TABLE constructive_infra_public.platform_function_execution_logs 
  ADD COLUMN message text;

ALTER TABLE constructive_infra_public.platform_function_execution_logs 
  ALTER COLUMN message SET NOT NULL;

COMMENT ON COLUMN constructive_infra_public.platform_function_execution_logs.message IS 'Log message text';

ALTER TABLE constructive_infra_public.platform_function_execution_logs 
  ADD COLUMN metadata jsonb;

COMMENT ON COLUMN constructive_infra_public.platform_function_execution_logs.metadata IS 'Structured context (labels, trace data, extra fields)';

ALTER TABLE constructive_infra_public.platform_function_execution_logs 
  ADD COLUMN task_identifier text;

COMMENT ON COLUMN constructive_infra_public.platform_function_execution_logs.task_identifier IS 'Function routing key (NULL for generic job logs)';

ALTER TABLE constructive_infra_public.platform_function_execution_logs 
  ADD CONSTRAINT platform_function_execution_logs_pkey PRIMARY KEY (created_at, id);

CREATE INDEX platform_function_execution_logs_invocation_id_created_at_idx ON constructive_infra_public.platform_function_execution_logs (invocation_id, created_at);

CREATE TABLE constructive_infra_public.platform_function_invocations (
  created_at timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

ALTER TABLE constructive_infra_public.platform_function_invocations 
  DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE constructive_infra_public.platform_function_invocations IS 'Function invocation log — INSERT to call a function (business-layer, metered)';

ALTER TABLE constructive_infra_public.platform_function_invocations 
  ADD COLUMN actor_id uuid;

COMMENT ON COLUMN constructive_infra_public.platform_function_invocations.actor_id IS 'Who triggered the invocation';

ALTER TABLE constructive_infra_public.platform_function_invocations 
  ADD COLUMN completed_at timestamptz;

COMMENT ON COLUMN constructive_infra_public.platform_function_invocations.completed_at IS 'When execution completed';

COMMENT ON COLUMN constructive_infra_public.platform_function_invocations.created_at IS 'Invocation creation timestamp (partition key)';

ALTER TABLE constructive_infra_public.platform_function_invocations 
  ADD COLUMN database_id uuid;

ALTER TABLE constructive_infra_public.platform_function_invocations 
  ALTER COLUMN database_id SET NOT NULL;

COMMENT ON COLUMN constructive_infra_public.platform_function_invocations.database_id IS 'Database that owns this resource (database-scoped isolation)';

ALTER TABLE constructive_infra_public.platform_function_invocations 
  ADD COLUMN duration_ms int;

COMMENT ON COLUMN constructive_infra_public.platform_function_invocations.duration_ms IS 'Wall-clock execution time in milliseconds';

ALTER TABLE constructive_infra_public.platform_function_invocations 
  ADD COLUMN error text;

COMMENT ON COLUMN constructive_infra_public.platform_function_invocations.error IS 'Error message when status is failed';

ALTER TABLE constructive_infra_public.platform_function_invocations 
  ADD COLUMN function_id uuid;

COMMENT ON COLUMN constructive_infra_public.platform_function_invocations.function_id IS 'Resolved function definition ID';

ALTER TABLE constructive_infra_public.platform_function_invocations 
  ADD COLUMN id uuid;

ALTER TABLE constructive_infra_public.platform_function_invocations 
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE constructive_infra_public.platform_function_invocations 
  ALTER COLUMN id SET DEFAULT uuidv7();

COMMENT ON COLUMN constructive_infra_public.platform_function_invocations.id IS 'Unique invocation identifier';

ALTER TABLE constructive_infra_public.platform_function_invocations 
  ADD COLUMN job_id bigint;

COMMENT ON COLUMN constructive_infra_public.platform_function_invocations.job_id IS 'FK to app_jobs.jobs — the underlying transport';

ALTER TABLE constructive_infra_public.platform_function_invocations 
  ADD COLUMN payload jsonb;

COMMENT ON COLUMN constructive_infra_public.platform_function_invocations.payload IS 'Function input payload';

ALTER TABLE constructive_infra_public.platform_function_invocations 
  ADD COLUMN result jsonb;

COMMENT ON COLUMN constructive_infra_public.platform_function_invocations.result IS 'Function return value (success) or structured error (failure)';

ALTER TABLE constructive_infra_public.platform_function_invocations 
  ADD COLUMN started_at timestamptz;

COMMENT ON COLUMN constructive_infra_public.platform_function_invocations.started_at IS 'When execution started';

ALTER TABLE constructive_infra_public.platform_function_invocations 
  ADD COLUMN status text;

ALTER TABLE constructive_infra_public.platform_function_invocations 
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE constructive_infra_public.platform_function_invocations 
  ALTER COLUMN status SET DEFAULT 'pending';

COMMENT ON COLUMN constructive_infra_public.platform_function_invocations.status IS 'Lifecycle: pending → running → completed/failed/cancelled';

ALTER TABLE constructive_infra_public.platform_function_invocations 
  ADD CONSTRAINT platform_function_invocations_status_chk 
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled'));

ALTER TABLE constructive_infra_public.platform_function_invocations 
  ADD COLUMN task_identifier text;

ALTER TABLE constructive_infra_public.platform_function_invocations 
  ALTER COLUMN task_identifier SET NOT NULL;

COMMENT ON COLUMN constructive_infra_public.platform_function_invocations.task_identifier IS 'Routing slug (scope:name) for the job worker';

ALTER TABLE constructive_infra_public.platform_function_invocations 
  ADD CONSTRAINT platform_function_invocations_pkey PRIMARY KEY (created_at, id);

CREATE INDEX platform_function_invocations_actor_id_created_at_idx ON constructive_infra_public.platform_function_invocations (actor_id, created_at);

CREATE INDEX platform_function_invocations_task_identifier_created_at_idx ON constructive_infra_public.platform_function_invocations (task_identifier, created_at);

CREATE TABLE constructive_infra_public.platform_function_invocations_default PARTITION OF constructive_infra_public.platform_function_invocations DEFAULT;

CREATE TABLE constructive_infra_public.platform_namespace_events (
  created_at timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

ALTER TABLE constructive_infra_public.platform_namespace_events 
  DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE constructive_infra_public.platform_namespace_events IS 'Namespace lifecycle events — audit log of creation, activation, deactivation, label changes';

ALTER TABLE constructive_infra_public.platform_namespace_events 
  ADD COLUMN actor_id uuid;

COMMENT ON COLUMN constructive_infra_public.platform_namespace_events.actor_id IS 'User who triggered this event (NULL for system/automated)';

ALTER TABLE constructive_infra_public.platform_namespace_events 
  ADD COLUMN cpu_millicores int;

COMMENT ON COLUMN constructive_infra_public.platform_namespace_events.cpu_millicores IS 'CPU usage in millicores at time of event';

COMMENT ON COLUMN constructive_infra_public.platform_namespace_events.created_at IS 'Event timestamp (partition key)';

ALTER TABLE constructive_infra_public.platform_namespace_events 
  ADD COLUMN database_id uuid;

ALTER TABLE constructive_infra_public.platform_namespace_events 
  ALTER COLUMN database_id SET NOT NULL;

COMMENT ON COLUMN constructive_infra_public.platform_namespace_events.database_id IS 'Database that owns this resource (database-scoped isolation)';

ALTER TABLE constructive_infra_public.platform_namespace_events 
  ADD COLUMN event_type text;

ALTER TABLE constructive_infra_public.platform_namespace_events 
  ALTER COLUMN event_type SET NOT NULL;

COMMENT ON COLUMN constructive_infra_public.platform_namespace_events.event_type IS 'Event type: created, activated, deactivated, labels_updated, annotations_updated, renamed';

ALTER TABLE constructive_infra_public.platform_namespace_events 
  ADD CONSTRAINT platform_namespace_events_event_type_chk 
    CHECK (event_type IN ('created', 'activated', 'deactivated', 'labels_updated', 'annotations_updated', 'renamed', 'deleted', 'metrics_snapshot', 'scaled', 'quota_exceeded', 'resource_warning'));

ALTER TABLE constructive_infra_public.platform_namespace_events 
  ADD COLUMN id uuid;

ALTER TABLE constructive_infra_public.platform_namespace_events 
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE constructive_infra_public.platform_namespace_events 
  ALTER COLUMN id SET DEFAULT uuidv7();

COMMENT ON COLUMN constructive_infra_public.platform_namespace_events.id IS 'Unique event identifier';

ALTER TABLE constructive_infra_public.platform_namespace_events 
  ADD COLUMN memory_bytes bigint;

COMMENT ON COLUMN constructive_infra_public.platform_namespace_events.memory_bytes IS 'Memory usage in bytes at time of event';

ALTER TABLE constructive_infra_public.platform_namespace_events 
  ADD COLUMN message text;

COMMENT ON COLUMN constructive_infra_public.platform_namespace_events.message IS 'Human-readable description of the event';

ALTER TABLE constructive_infra_public.platform_namespace_events 
  ADD COLUMN metadata jsonb;

COMMENT ON COLUMN constructive_infra_public.platform_namespace_events.metadata IS 'Structured context (old/new values, labels diff, etc.)';

ALTER TABLE constructive_infra_public.platform_namespace_events 
  ADD COLUMN metrics jsonb;

COMMENT ON COLUMN constructive_infra_public.platform_namespace_events.metrics IS 'Additional resource metrics (gpu, replicas, quotas, etc.)';

ALTER TABLE constructive_infra_public.platform_namespace_events 
  ADD COLUMN namespace_id uuid;

ALTER TABLE constructive_infra_public.platform_namespace_events 
  ALTER COLUMN namespace_id SET NOT NULL;

COMMENT ON COLUMN constructive_infra_public.platform_namespace_events.namespace_id IS 'Namespace this event belongs to';

ALTER TABLE constructive_infra_public.platform_namespace_events 
  ADD COLUMN network_egress_bytes bigint;

COMMENT ON COLUMN constructive_infra_public.platform_namespace_events.network_egress_bytes IS 'Network egress in bytes during event window';

ALTER TABLE constructive_infra_public.platform_namespace_events 
  ADD COLUMN network_ingress_bytes bigint;

COMMENT ON COLUMN constructive_infra_public.platform_namespace_events.network_ingress_bytes IS 'Network ingress in bytes during event window';

ALTER TABLE constructive_infra_public.platform_namespace_events 
  ADD COLUMN pod_count int;

COMMENT ON COLUMN constructive_infra_public.platform_namespace_events.pod_count IS 'Number of active pods in the namespace at time of event';

ALTER TABLE constructive_infra_public.platform_namespace_events 
  ADD COLUMN storage_bytes bigint;

COMMENT ON COLUMN constructive_infra_public.platform_namespace_events.storage_bytes IS 'Storage usage in bytes at time of event';

ALTER TABLE constructive_infra_public.platform_namespace_events 
  ADD CONSTRAINT platform_namespace_events_pkey PRIMARY KEY (created_at, id);

CREATE INDEX platform_namespace_events_namespace_id_created_at_idx ON constructive_infra_public.platform_namespace_events (namespace_id, created_at);

CREATE TABLE constructive_infra_public.platform_namespace_events_default PARTITION OF constructive_infra_public.platform_namespace_events DEFAULT;

ALTER TABLE constructive_infra_public.platform_namespaces 
  DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE constructive_infra_public.platform_namespaces IS 'Logical namespace containers for grouping secrets, config, functions, and other resources';

ALTER TABLE constructive_infra_public.platform_namespaces 
  ADD COLUMN annotations jsonb;

ALTER TABLE constructive_infra_public.platform_namespaces 
  ALTER COLUMN annotations SET NOT NULL;

ALTER TABLE constructive_infra_public.platform_namespaces 
  ALTER COLUMN annotations SET DEFAULT '{}'::jsonb;

COMMENT ON COLUMN constructive_infra_public.platform_namespaces.annotations IS 'Freeform metadata for tooling and operational notes';

ALTER TABLE constructive_infra_public.platform_namespaces 
  ADD COLUMN created_at timestamptz;

ALTER TABLE constructive_infra_public.platform_namespaces 
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE constructive_infra_public.platform_namespaces 
  ADD COLUMN database_id uuid;

ALTER TABLE constructive_infra_public.platform_namespaces 
  ALTER COLUMN database_id SET NOT NULL;

COMMENT ON COLUMN constructive_infra_public.platform_namespaces.database_id IS 'Database that owns this resource (database-scoped isolation)';

ALTER TABLE constructive_infra_public.platform_namespaces 
  ADD COLUMN description text;

COMMENT ON COLUMN constructive_infra_public.platform_namespaces.description IS 'Optional human-readable description of this namespace';

ALTER TABLE constructive_infra_public.platform_namespaces 
  ADD COLUMN id uuid;

ALTER TABLE constructive_infra_public.platform_namespaces 
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE constructive_infra_public.platform_namespaces 
  ALTER COLUMN id SET DEFAULT uuidv7();

ALTER TABLE constructive_infra_public.platform_namespaces 
  ADD COLUMN is_active boolean;

ALTER TABLE constructive_infra_public.platform_namespaces 
  ALTER COLUMN is_active SET NOT NULL;

ALTER TABLE constructive_infra_public.platform_namespaces 
  ALTER COLUMN is_active SET DEFAULT true;

COMMENT ON COLUMN constructive_infra_public.platform_namespaces.is_active IS 'Whether this namespace is active (soft-disable for filtering)';

ALTER TABLE constructive_infra_public.platform_namespaces 
  ADD COLUMN labels jsonb;

ALTER TABLE constructive_infra_public.platform_namespaces 
  ALTER COLUMN labels SET NOT NULL;

ALTER TABLE constructive_infra_public.platform_namespaces 
  ALTER COLUMN labels SET DEFAULT '{}'::jsonb;

COMMENT ON COLUMN constructive_infra_public.platform_namespaces.labels IS 'Key/value pairs for selecting and filtering namespaces';

ALTER TABLE constructive_infra_public.platform_namespaces 
  ADD COLUMN name text;

ALTER TABLE constructive_infra_public.platform_namespaces 
  ALTER COLUMN name SET NOT NULL;

COMMENT ON COLUMN constructive_infra_public.platform_namespaces.name IS 'Human-readable namespace name (e.g. default, production, oauth)';

ALTER TABLE constructive_infra_public.platform_namespaces 
  ADD COLUMN namespace_name text;

ALTER TABLE constructive_infra_public.platform_namespaces 
  ALTER COLUMN namespace_name SET NOT NULL;

COMMENT ON COLUMN constructive_infra_public.platform_namespaces.namespace_name IS 'Globally unique computed namespace identifier via inflection.underscore';

ALTER TABLE constructive_infra_public.platform_namespaces 
  ADD COLUMN updated_at timestamptz;

ALTER TABLE constructive_infra_public.platform_namespaces 
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE constructive_infra_public.platform_namespaces 
  ADD CONSTRAINT platform_namespaces_database_id_name_key 
    UNIQUE (database_id, name);

ALTER TABLE constructive_infra_public.platform_namespaces 
  ADD CONSTRAINT platform_namespaces_namespace_name_key 
    UNIQUE (namespace_name);

ALTER TABLE constructive_infra_public.platform_namespaces 
  ADD CONSTRAINT platform_namespaces_pkey PRIMARY KEY (id);

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ADD CONSTRAINT platform_function_definitions_namespace_id_fkey
    FOREIGN KEY(namespace_id)
    REFERENCES constructive_infra_public.platform_namespaces (id)
    ON DELETE SET NULL;

CREATE INDEX platform_namespaces_created_at_idx ON constructive_infra_public.platform_namespaces (created_at);

CREATE INDEX platform_namespaces_updated_at_idx ON constructive_infra_public.platform_namespaces (updated_at);

CREATE TRIGGER platform_namespaces_rename_proxy_insert_tg
  BEFORE INSERT
  ON constructive_infra_public.platform_namespaces
  FOR EACH ROW
  EXECUTE PROCEDURE constructive_infra_private.platform_namespaces_rename_proxy();

CREATE TRIGGER platform_namespaces_rename_proxy_update_tg
  BEFORE UPDATE
  ON constructive_infra_public.platform_namespaces
  FOR EACH ROW
  WHEN (old.name IS DISTINCT FROM new.name)
  EXECUTE PROCEDURE constructive_infra_private.platform_namespaces_rename_proxy();

CREATE TRIGGER timestamps_tg
  BEFORE INSERT OR UPDATE
  ON constructive_infra_public.platform_namespaces
  FOR EACH ROW
  EXECUTE PROCEDURE stamps.timestamps();

CREATE TABLE constructive_infra_public.platform_secret_definitions ();

ALTER TABLE constructive_infra_public.platform_secret_definitions 
  DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE constructive_infra_public.platform_secret_definitions IS 'Global secret name registry — declares which secrets the platform recognizes. Actual values live in app_secrets.';

ALTER TABLE constructive_infra_public.platform_secret_definitions 
  ADD COLUMN annotations jsonb;

ALTER TABLE constructive_infra_public.platform_secret_definitions 
  ALTER COLUMN annotations SET NOT NULL;

ALTER TABLE constructive_infra_public.platform_secret_definitions 
  ALTER COLUMN annotations SET DEFAULT '{}'::jsonb;

COMMENT ON COLUMN constructive_infra_public.platform_secret_definitions.annotations IS 'Freeform metadata annotations for secret definitions';

ALTER TABLE constructive_infra_public.platform_secret_definitions 
  ADD COLUMN created_at timestamptz;

ALTER TABLE constructive_infra_public.platform_secret_definitions 
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE constructive_infra_public.platform_secret_definitions 
  ADD COLUMN database_id uuid;

ALTER TABLE constructive_infra_public.platform_secret_definitions 
  ALTER COLUMN database_id SET NOT NULL;

COMMENT ON COLUMN constructive_infra_public.platform_secret_definitions.database_id IS 'Database that owns this resource (database-scoped isolation)';

ALTER TABLE constructive_infra_public.platform_secret_definitions 
  ADD COLUMN description text;

COMMENT ON COLUMN constructive_infra_public.platform_secret_definitions.description IS 'Human-readable description of what this secret is used for';

ALTER TABLE constructive_infra_public.platform_secret_definitions 
  ADD COLUMN id uuid;

ALTER TABLE constructive_infra_public.platform_secret_definitions 
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE constructive_infra_public.platform_secret_definitions 
  ALTER COLUMN id SET DEFAULT uuidv7();

ALTER TABLE constructive_infra_public.platform_secret_definitions 
  ADD COLUMN is_built_in boolean;

ALTER TABLE constructive_infra_public.platform_secret_definitions 
  ALTER COLUMN is_built_in SET NOT NULL;

ALTER TABLE constructive_infra_public.platform_secret_definitions 
  ALTER COLUMN is_built_in SET DEFAULT false;

COMMENT ON COLUMN constructive_infra_public.platform_secret_definitions.is_built_in IS 'Whether this row was seeded as a built-in secret definition. Built-in rows are immutable.';

ALTER TABLE constructive_infra_public.platform_secret_definitions 
  ADD COLUMN labels jsonb;

ALTER TABLE constructive_infra_public.platform_secret_definitions 
  ALTER COLUMN labels SET NOT NULL;

ALTER TABLE constructive_infra_public.platform_secret_definitions 
  ALTER COLUMN labels SET DEFAULT '{}'::jsonb;

COMMENT ON COLUMN constructive_infra_public.platform_secret_definitions.labels IS 'Key-value metadata for filtering and grouping secret definitions';

ALTER TABLE constructive_infra_public.platform_secret_definitions 
  ADD COLUMN name text;

ALTER TABLE constructive_infra_public.platform_secret_definitions 
  ALTER COLUMN name SET NOT NULL;

COMMENT ON COLUMN constructive_infra_public.platform_secret_definitions.name IS 'Secret name (must match app_secrets.name for resolution)';

ALTER TABLE constructive_infra_public.platform_secret_definitions 
  ADD COLUMN updated_at timestamptz;

ALTER TABLE constructive_infra_public.platform_secret_definitions 
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE constructive_infra_public.platform_secret_definitions 
  ADD CONSTRAINT platform_secret_definitions_name_key 
    UNIQUE (name);

ALTER TABLE constructive_infra_public.platform_secret_definitions 
  ADD CONSTRAINT platform_secret_definitions_pkey PRIMARY KEY (id);

CREATE INDEX platform_secret_definitions_created_at_idx ON constructive_infra_public.platform_secret_definitions (created_at);

CREATE INDEX platform_secret_definitions_updated_at_idx ON constructive_infra_public.platform_secret_definitions (updated_at);

CREATE TRIGGER timestamps_tg
  BEFORE INSERT OR UPDATE
  ON constructive_infra_public.platform_secret_definitions
  FOR EACH ROW
  EXECUTE PROCEDURE stamps.timestamps();

CREATE TYPE constructive_infra_public.function_requirement AS (name text, required boolean);

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ADD COLUMN required_configs constructive_infra_public.function_requirement[];

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ALTER COLUMN required_configs SET NOT NULL;

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ALTER COLUMN required_configs SET DEFAULT CAST(ARRAY[] AS constructive_infra_public.function_requirement[]);

COMMENT ON COLUMN constructive_infra_public.platform_function_definitions.required_configs IS 'Embedded config requirements: array of (name, required) tuples';

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ADD COLUMN required_secrets constructive_infra_public.function_requirement[];

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ALTER COLUMN required_secrets SET NOT NULL;

ALTER TABLE constructive_infra_public.platform_function_definitions 
  ALTER COLUMN required_secrets SET DEFAULT CAST(ARRAY[] AS constructive_infra_public.function_requirement[]);

COMMENT ON COLUMN constructive_infra_public.platform_function_definitions.required_secrets IS 'Embedded secret requirements: array of (name, required) tuples';