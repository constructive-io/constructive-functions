-- Deploy: schemas/constructive_platform_function_graph_public/schema/default_function_privs/authenticated
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_public/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_platform_function_graph_public" GRANT ALL ON FUNCTIONS TO authenticated;

