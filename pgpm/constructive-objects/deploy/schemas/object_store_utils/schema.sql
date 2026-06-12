-- Deploy: schemas/object_store_utils/schema
-- made with <3 @ constructive.io


CREATE SCHEMA object_store_utils;

GRANT USAGE ON SCHEMA object_store_utils
TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA object_store_utils
GRANT EXECUTE ON FUNCTIONS
TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA object_store_utils
GRANT ALL ON SEQUENCES
TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA object_store_utils
GRANT ALL ON TABLES
TO authenticated;
