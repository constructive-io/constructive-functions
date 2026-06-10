-- Revert: schemas/constructive_compute_private/schema/default_function_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_compute_private" REVOKE ALL ON FUNCTIONS FROM authenticated;


