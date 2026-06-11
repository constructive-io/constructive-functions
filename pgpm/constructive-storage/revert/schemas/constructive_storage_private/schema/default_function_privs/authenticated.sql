-- Revert: schemas/constructive_storage_private/schema/default_function_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_storage_private" REVOKE ALL ON FUNCTIONS FROM authenticated;


