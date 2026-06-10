-- Deploy: schemas/constructive_storage_private/schema/default_seq_privs/administrator
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_private/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_storage_private" GRANT USAGE ON SEQUENCES TO administrator;

