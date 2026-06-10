-- Revert: schemas/constructive_storage_private/schema/default_function_privs/anonymous


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_storage_private" REVOKE ALL ON FUNCTIONS FROM anonymous;


