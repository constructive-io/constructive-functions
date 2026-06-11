-- Deploy schemas/services_public/tables/rls_settings/table to pg

-- requires: schemas/services_public/schema

BEGIN;

-- Per-database RLS module runtime configuration.
-- Typed replacement for api_modules rows with name = 'rls_module'.
-- One row per database; the server reads this instead of the JSONB blob.
CREATE TABLE services_public.rls_settings (
    id uuid PRIMARY KEY DEFAULT uuidv7(),
    database_id uuid NOT NULL UNIQUE,

    -- Schema references (FK to metaschema_public.schema)
    authenticate_schema_id uuid,
    role_schema_id uuid,

    -- Function references (FK to metaschema_public.function)
    authenticate_function_id uuid,
    authenticate_strict_function_id uuid,
    current_role_function_id uuid,
    current_role_id_function_id uuid,
    current_user_agent_function_id uuid,
    current_ip_address_function_id uuid
);

COMMENT ON TABLE services_public.rls_settings IS 'Per-database RLS module runtime configuration; typed replacement for api_modules rls_module JSONB entries';
COMMENT ON COLUMN services_public.rls_settings.id IS 'Unique identifier for this RLS settings record';
COMMENT ON COLUMN services_public.rls_settings.database_id IS 'Reference to the metaschema database';
COMMENT ON COLUMN services_public.rls_settings.authenticate_schema_id IS 'Schema containing authenticate/authenticate_strict functions (FK to metaschema_public.schema)';
COMMENT ON COLUMN services_public.rls_settings.role_schema_id IS 'Schema containing current_role and related functions (FK to metaschema_public.schema)';
COMMENT ON COLUMN services_public.rls_settings.authenticate_function_id IS 'Reference to the authenticate function (FK to metaschema_public.function)';
COMMENT ON COLUMN services_public.rls_settings.authenticate_strict_function_id IS 'Reference to the strict authenticate function (FK to metaschema_public.function)';
COMMENT ON COLUMN services_public.rls_settings.current_role_function_id IS 'Reference to the current_role function (FK to metaschema_public.function)';
COMMENT ON COLUMN services_public.rls_settings.current_role_id_function_id IS 'Reference to the current_role_id function (FK to metaschema_public.function)';
COMMENT ON COLUMN services_public.rls_settings.current_user_agent_function_id IS 'Reference to the current_user_agent function (FK to metaschema_public.function)';
COMMENT ON COLUMN services_public.rls_settings.current_ip_address_function_id IS 'Reference to the current_ip_address function (FK to metaschema_public.function)';

CREATE INDEX rls_settings_database_id_idx ON services_public.rls_settings (database_id);

COMMIT;
