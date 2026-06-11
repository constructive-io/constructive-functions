-- Deploy: schemas/constructive_objects_private/schema/default_seq_privs/authenticated
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_private/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_objects_private" GRANT USAGE ON SEQUENCES TO authenticated;

