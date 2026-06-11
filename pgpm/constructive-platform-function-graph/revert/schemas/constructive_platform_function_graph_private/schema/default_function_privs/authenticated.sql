-- Revert: schemas/constructive_platform_function_graph_private/schema/default_function_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_platform_function_graph_private" REVOKE ALL ON FUNCTIONS FROM authenticated;


