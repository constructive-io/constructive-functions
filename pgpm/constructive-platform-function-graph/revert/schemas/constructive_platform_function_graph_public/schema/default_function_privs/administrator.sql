-- Revert: schemas/constructive_platform_function_graph_public/schema/default_function_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_platform_function_graph_public" REVOKE ALL ON FUNCTIONS FROM administrator;


