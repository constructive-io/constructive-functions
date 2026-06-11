-- Revert: schemas/constructive_compute_private/schema/default_function_privs/anonymous


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_compute_private" REVOKE ALL ON FUNCTIONS FROM anonymous;


