-- Revert: schemas/constructive_platform_function_graph_public/schema/default_table_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_platform_function_graph_public" REVOKE ALL ON TABLES FROM administrator;


