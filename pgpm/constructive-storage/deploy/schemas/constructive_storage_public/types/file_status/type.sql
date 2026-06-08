-- Deploy: schemas/constructive_storage_public/types/file_status/type
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema


CREATE TYPE "constructive_storage_public".file_status AS ENUM ( 'requested', 'uploaded', 'processed' );

