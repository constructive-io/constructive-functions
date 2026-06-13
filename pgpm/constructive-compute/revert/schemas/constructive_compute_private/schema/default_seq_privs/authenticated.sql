-- Revert: schemas/constructive_compute_private/schema/default_seq_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_compute_private" REVOKE USAGE ON SEQUENCES FROM authenticated;


