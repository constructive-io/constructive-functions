-- Deploy: schemas/constructive_compute_public/schema/default_function_privs/authenticated
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_compute_public" GRANT ALL ON FUNCTIONS TO authenticated;

