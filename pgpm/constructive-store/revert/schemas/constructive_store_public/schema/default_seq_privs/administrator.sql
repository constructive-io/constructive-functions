-- Revert: schemas/constructive_store_public/schema/default_seq_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_store_public" REVOKE USAGE ON SEQUENCES FROM administrator;


