-- Deploy: schemas/constructive_compute_public/schema/default_function_privs/administrator
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_compute_public" GRANT ALL ON FUNCTIONS TO administrator;

