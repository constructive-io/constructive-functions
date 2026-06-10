-- Revert: schemas/constructive_platform_function_graph_private/schema/default_seq_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_platform_function_graph_private" REVOKE USAGE ON SEQUENCES FROM authenticated;


