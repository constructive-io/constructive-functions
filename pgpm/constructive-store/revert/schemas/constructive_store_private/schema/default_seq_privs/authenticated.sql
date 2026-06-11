-- Revert: schemas/constructive_store_private/schema/default_seq_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_store_private" REVOKE USAGE ON SEQUENCES FROM authenticated;


