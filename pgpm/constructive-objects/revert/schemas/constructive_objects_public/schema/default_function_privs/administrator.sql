-- Revert: schemas/constructive_objects_public/schema/default_function_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_objects_public" REVOKE ALL ON FUNCTIONS FROM administrator;


