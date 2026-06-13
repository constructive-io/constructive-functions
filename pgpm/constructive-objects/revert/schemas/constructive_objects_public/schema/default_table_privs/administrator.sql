-- Revert: schemas/constructive_objects_public/schema/default_table_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_objects_public" REVOKE ALL ON TABLES FROM administrator;


