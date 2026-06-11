-- Revert: schemas/constructive_objects_public/schema/default_seq_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_objects_public" REVOKE USAGE ON SEQUENCES FROM authenticated;


