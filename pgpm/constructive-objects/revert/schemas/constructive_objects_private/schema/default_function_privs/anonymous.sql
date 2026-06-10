-- Revert: schemas/constructive_objects_private/schema/default_function_privs/anonymous


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_objects_private" REVOKE ALL ON FUNCTIONS FROM anonymous;


