-- Revert: schemas/constructive_storage_public/schema/default_function_privs/anonymous


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_storage_public" REVOKE ALL ON FUNCTIONS FROM anonymous;


