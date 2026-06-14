-- Deploy: grants/standalone_schema_access
-- made with <3 @ constructive.io
--
-- Standalone dev-mode grants for the authenticated and anonymous roles.
--
-- In the monolith, schema USAGE and table SELECT are granted at provisioning
-- time by the RLS module. In standalone mode there is no provisioning step,
-- so we grant access explicitly for every public schema that the GraphQL
-- APIs expose.
--
-- The objects, storage, and store modules already carry their own grants;
-- compute, infra, users, and platform_function_graph do not.

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════════
-- AUTHENTICATED role (full CRUD)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Schema USAGE ────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA constructive_compute_public                 TO authenticated;
GRANT USAGE ON SCHEMA constructive_platform_function_graph_public TO authenticated;
GRANT USAGE ON SCHEMA constructive_infra_public                   TO authenticated;
GRANT USAGE ON SCHEMA constructive_users_public                   TO authenticated;

-- ─── Table SELECT (read-only is sufficient for the GraphQL explorer) ─────────
GRANT SELECT ON ALL TABLES IN SCHEMA constructive_compute_public                 TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA constructive_platform_function_graph_public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA constructive_infra_public                   TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA constructive_users_public                   TO authenticated;

-- ─── INSERT / UPDATE / DELETE for mutations ──────────────────────────────────
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA constructive_compute_public                 TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA constructive_platform_function_graph_public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA constructive_infra_public                   TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA constructive_users_public                   TO authenticated;

-- ─── Sequences (needed for serial / GENERATED columns) ──────────────────────
GRANT USAGE ON ALL SEQUENCES IN SCHEMA constructive_compute_public                 TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA constructive_platform_function_graph_public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA constructive_infra_public                   TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA constructive_users_public                   TO authenticated;

-- ─── Private schemas (for functions/triggers that need cross-schema access) ──
GRANT USAGE ON SCHEMA constructive_compute_private                          TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA constructive_compute_private           TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA constructive_compute_private        TO authenticated;

GRANT USAGE ON SCHEMA constructive_platform_function_graph_private          TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA constructive_platform_function_graph_private TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA constructive_platform_function_graph_private TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ANONYMOUS role (read-only — used by PostGraphile for unauthenticated requests)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Schema USAGE ────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA constructive_compute_public                 TO anonymous;
GRANT USAGE ON SCHEMA constructive_platform_function_graph_public TO anonymous;
GRANT USAGE ON SCHEMA constructive_infra_public                   TO anonymous;
GRANT USAGE ON SCHEMA constructive_users_public                   TO anonymous;

-- ─── Table SELECT ────────────────────────────────────────────────────────────
GRANT SELECT ON ALL TABLES IN SCHEMA constructive_compute_public                 TO anonymous;
GRANT SELECT ON ALL TABLES IN SCHEMA constructive_platform_function_graph_public TO anonymous;
GRANT SELECT ON ALL TABLES IN SCHEMA constructive_infra_public                   TO anonymous;
GRANT SELECT ON ALL TABLES IN SCHEMA constructive_users_public                   TO anonymous;

-- ─── Sequences (needed if any SELECT depends on sequence currval) ────────────
GRANT USAGE ON ALL SEQUENCES IN SCHEMA constructive_compute_public                 TO anonymous;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA constructive_platform_function_graph_public TO anonymous;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA constructive_infra_public                   TO anonymous;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA constructive_users_public                   TO anonymous;

-- ─── Private schema function execution (for SECURITY DEFINER callers) ────────
GRANT USAGE ON SCHEMA constructive_compute_private                          TO anonymous;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA constructive_compute_private        TO anonymous;

GRANT USAGE ON SCHEMA constructive_platform_function_graph_private          TO anonymous;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA constructive_platform_function_graph_private TO anonymous;

COMMIT;
