-- Deploy: schemas/constructive_compute_public/schema/default_table_privs/anonymous
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_compute_public" GRANT SELECT ON TABLES TO anonymous;
