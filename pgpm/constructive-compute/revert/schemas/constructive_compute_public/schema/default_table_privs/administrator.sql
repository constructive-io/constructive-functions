-- Revert: schemas/constructive_compute_public/schema/default_table_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_compute_public" REVOKE ALL ON TABLES FROM administrator;


