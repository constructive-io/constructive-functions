-- Revert: schemas/constructive_platform_function_graph_private/schema/default_function_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_platform_function_graph_private" REVOKE ALL ON FUNCTIONS FROM administrator;


