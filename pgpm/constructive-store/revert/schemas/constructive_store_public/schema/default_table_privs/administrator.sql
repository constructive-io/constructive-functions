-- Revert: schemas/constructive_store_public/schema/default_table_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_store_public" REVOKE ALL ON TABLES FROM administrator;


