\echo Use "CREATE EXTENSION constructive-compute-stubs" to load this file. \quit
CREATE SCHEMA constructive_infra_private;

CREATE SCHEMA constructive_infra_public;

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

INSERT INTO metaschema_public.partition (
  id,
  database_id,
  table_id,
  strategy,
  partition_key_id,
  "interval",
  retention,
  retention_keep_table,
  premake,
  naming_pattern
) VALUES
  ('e0696c85-efbc-618f-6b99-a1ff6bd70693', '028752cb-510b-1438-2f39-64534bd1cbd7', '064c30f3-e2b2-fb9d-5d89-8f55b3b56e6f', 'range', 'aa53c519-03a3-e1d0-2897-4de110ae05c0', '1 month', '12 months', true, 2, '{parent}_{bounds}') ON CONFLICT (table_id) DO NOTHING;

CREATE TABLE constructive_infra_public.platform_namespaces ();

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

CREATE INDEX platform_namespaces_created_at_idx ON constructive_infra_public.platform_namespaces (created_at);

CREATE INDEX platform_namespaces_updated_at_idx ON constructive_infra_public.platform_namespaces (updated_at);

CREATE SCHEMA constructive_users_public;

CREATE TABLE constructive_users_public.role_types ();

ALTER TABLE constructive_users_public.role_types 
  DISABLE ROW LEVEL SECURITY;

ALTER TABLE constructive_users_public.role_types 
  ADD COLUMN id int;

ALTER TABLE constructive_users_public.role_types 
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE constructive_users_public.role_types 
  ADD COLUMN name citext;

ALTER TABLE constructive_users_public.role_types 
  ALTER COLUMN name SET NOT NULL;

ALTER TABLE constructive_users_public.role_types 
  ADD CONSTRAINT role_types_name_key 
    UNIQUE (name);

ALTER TABLE constructive_users_public.role_types 
  ADD CONSTRAINT role_types_pkey PRIMARY KEY (id);

CREATE TABLE constructive_users_public.users ();

ALTER TABLE constructive_users_public.users 
  DISABLE ROW LEVEL SECURITY;

ALTER TABLE constructive_users_public.users 
  ADD COLUMN created_at timestamptz;

ALTER TABLE constructive_users_public.users 
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE constructive_users_public.users 
  ADD COLUMN display_name text;

ALTER TABLE constructive_users_public.users 
  ADD CONSTRAINT users_display_name_chk 
    CHECK (character_length(display_name) <= 256);

ALTER TABLE constructive_users_public.users 
  ADD COLUMN id uuid;

ALTER TABLE constructive_users_public.users 
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE constructive_users_public.users 
  ALTER COLUMN id SET DEFAULT uuidv7();

ALTER TABLE constructive_users_public.users 
  ADD COLUMN profile_picture image;

ALTER TABLE constructive_users_public.users 
  ADD COLUMN search_tsv tsvector;

ALTER TABLE constructive_users_public.users 
  ADD COLUMN type int;

ALTER TABLE constructive_users_public.users 
  ALTER COLUMN type SET NOT NULL;

ALTER TABLE constructive_users_public.users 
  ALTER COLUMN type SET DEFAULT 1;

ALTER TABLE constructive_users_public.users 
  ADD COLUMN updated_at timestamptz;

ALTER TABLE constructive_users_public.users 
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE constructive_users_public.users 
  ADD COLUMN username citext;

ALTER TABLE constructive_users_public.users 
  ADD CONSTRAINT users_username_chk 
    CHECK (character_length(username) <= 256);

ALTER TABLE constructive_users_public.users 
  ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE constructive_users_public.users 
  ADD CONSTRAINT users_type_fkey
    FOREIGN KEY(type)
    REFERENCES constructive_users_public.role_types (id)
    ON DELETE RESTRICT;

ALTER TABLE constructive_users_public.users 
  ADD CONSTRAINT users_username_key 
    UNIQUE (username);

CREATE INDEX users_created_at_idx ON constructive_users_public.users (created_at);

CREATE INDEX users_search_tsv_gin_idx ON constructive_users_public.users USING gin (search_tsv);

CREATE INDEX users_updated_at_idx ON constructive_users_public.users (updated_at);