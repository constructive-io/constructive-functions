-- Deploy: schemas/constructive_storage_private/schema/default_function_privs/authenticated
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_private/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_storage_private" GRANT ALL ON FUNCTIONS TO authenticated;

