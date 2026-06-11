-- Revert: schemas/constructive_storage_public/schema/default_seq_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_storage_public" REVOKE USAGE ON SEQUENCES FROM authenticated;


