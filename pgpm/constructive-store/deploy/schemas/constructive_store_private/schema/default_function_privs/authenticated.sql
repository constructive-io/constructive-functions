-- Deploy: schemas/constructive_store_private/schema/default_function_privs/authenticated
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_store_private" GRANT ALL ON FUNCTIONS TO authenticated;

