-- Revert: schemas/constructive_store_public/schema/default_function_privs/anonymous


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_store_public" REVOKE ALL ON FUNCTIONS FROM anonymous;


