-- Deploy: schemas/constructive_compute_private/schema/default_function_privs/administrator
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_compute_private" GRANT ALL ON FUNCTIONS TO administrator;

