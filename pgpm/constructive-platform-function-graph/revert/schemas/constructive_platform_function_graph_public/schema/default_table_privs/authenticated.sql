-- Revert: schemas/constructive_platform_function_graph_public/schema/default_table_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_platform_function_graph_public" REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM authenticated;
