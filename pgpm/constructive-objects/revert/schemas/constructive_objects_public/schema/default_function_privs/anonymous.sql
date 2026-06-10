-- Revert: schemas/constructive_objects_public/schema/default_function_privs/anonymous


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_objects_public" REVOKE ALL ON FUNCTIONS FROM anonymous;


