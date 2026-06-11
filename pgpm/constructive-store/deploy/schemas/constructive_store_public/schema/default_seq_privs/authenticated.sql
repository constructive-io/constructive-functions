-- Deploy: schemas/constructive_store_public/schema/default_seq_privs/authenticated
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_store_public" GRANT USAGE ON SEQUENCES TO authenticated;

