-- Revert: schemas/constructive_objects_private/schema/default_function_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_objects_private" REVOKE ALL ON FUNCTIONS FROM authenticated;


