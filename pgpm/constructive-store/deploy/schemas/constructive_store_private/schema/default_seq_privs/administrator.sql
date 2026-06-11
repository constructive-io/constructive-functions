-- Deploy: schemas/constructive_store_private/schema/default_seq_privs/administrator
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_store_private" GRANT USAGE ON SEQUENCES TO administrator;

