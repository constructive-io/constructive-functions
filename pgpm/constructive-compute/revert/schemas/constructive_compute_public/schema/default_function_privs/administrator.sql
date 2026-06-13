-- Revert: schemas/constructive_compute_public/schema/default_function_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_compute_public" REVOKE ALL ON FUNCTIONS FROM administrator;


