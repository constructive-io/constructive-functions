-- Revert: schemas/constructive_objects_private/schema/default_table_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_objects_private" REVOKE ALL ON TABLES FROM administrator;


