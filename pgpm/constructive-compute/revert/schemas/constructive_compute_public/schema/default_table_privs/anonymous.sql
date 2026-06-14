-- Revert: schemas/constructive_compute_public/schema/default_table_privs/anonymous


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_compute_public" REVOKE SELECT ON TABLES FROM anonymous;
