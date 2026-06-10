-- Revert: schemas/constructive_store_private/schema/default_table_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_store_private" REVOKE ALL ON TABLES FROM administrator;


