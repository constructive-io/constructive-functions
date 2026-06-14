-- Revert: schemas/constructive_compute_public/schema/default_table_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_compute_public" REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM authenticated;
