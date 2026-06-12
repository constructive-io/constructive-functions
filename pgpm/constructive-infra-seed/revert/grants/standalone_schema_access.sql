-- Revert: grants/standalone_schema_access
-- made with <3 @ constructive.io

BEGIN;

REVOKE ALL ON ALL TABLES    IN SCHEMA constructive_compute_public                 FROM authenticated;
REVOKE ALL ON ALL TABLES    IN SCHEMA constructive_platform_function_graph_public FROM authenticated;
REVOKE ALL ON ALL TABLES    IN SCHEMA constructive_infra_public                   FROM authenticated;
REVOKE ALL ON ALL TABLES    IN SCHEMA constructive_users_public                   FROM authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA constructive_compute_public                 FROM authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA constructive_platform_function_graph_public FROM authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA constructive_infra_public                   FROM authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA constructive_users_public                   FROM authenticated;
REVOKE USAGE ON SCHEMA constructive_compute_public                 FROM authenticated;
REVOKE USAGE ON SCHEMA constructive_platform_function_graph_public FROM authenticated;
REVOKE USAGE ON SCHEMA constructive_infra_public                   FROM authenticated;
REVOKE USAGE ON SCHEMA constructive_users_public                   FROM authenticated;
REVOKE ALL ON ALL TABLES    IN SCHEMA constructive_compute_private FROM authenticated;
REVOKE USAGE ON SCHEMA constructive_compute_private                FROM authenticated;

COMMIT;
