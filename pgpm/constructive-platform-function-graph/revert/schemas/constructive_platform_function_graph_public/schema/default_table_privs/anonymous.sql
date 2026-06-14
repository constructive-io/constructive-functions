-- Revert: schemas/constructive_platform_function_graph_public/schema/default_table_privs/anonymous


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_platform_function_graph_public" REVOKE SELECT ON TABLES FROM anonymous;
