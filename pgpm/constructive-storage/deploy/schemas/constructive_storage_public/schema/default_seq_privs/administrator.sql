-- Deploy: schemas/constructive_storage_public/schema/default_seq_privs/administrator
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_storage_public" GRANT USAGE ON SEQUENCES TO administrator;

