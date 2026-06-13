-- Revert: schemas/constructive_compute_private/schema/default_table_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_compute_private" REVOKE ALL ON TABLES FROM administrator;


