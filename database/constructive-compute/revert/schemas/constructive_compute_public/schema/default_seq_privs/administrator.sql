-- Revert: schemas/constructive_compute_public/schema/default_seq_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_compute_public" REVOKE USAGE ON SEQUENCES FROM administrator;


