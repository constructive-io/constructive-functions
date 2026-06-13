-- Revert: schemas/constructive_storage_private/schema/default_seq_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_storage_private" REVOKE USAGE ON SEQUENCES FROM authenticated;


