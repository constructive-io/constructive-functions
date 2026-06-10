-- Deploy: schemas/constructive_platform_function_graph_private/schema/default_function_privs/authenticated
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_private/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_platform_function_graph_private" GRANT ALL ON FUNCTIONS TO authenticated;

