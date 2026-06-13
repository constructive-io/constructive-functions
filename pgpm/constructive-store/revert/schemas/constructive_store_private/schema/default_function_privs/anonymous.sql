-- Revert: schemas/constructive_store_private/schema/default_function_privs/anonymous


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_store_private" REVOKE ALL ON FUNCTIONS FROM anonymous;


