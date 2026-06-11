-- Revert: schemas/constructive_objects_private/schema/default_seq_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA "constructive_objects_private" REVOKE USAGE ON SEQUENCES FROM authenticated;


