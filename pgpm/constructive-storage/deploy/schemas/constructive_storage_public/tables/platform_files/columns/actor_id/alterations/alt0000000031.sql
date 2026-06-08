-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/actor_id/alterations/alt0000000031
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/actor_id/column


COMMENT ON COLUMN "constructive_storage_public".platform_files.actor_id IS E'User who uploaded this file. Forced to current_user_id() on INSERT. Used for UPDATE/DELETE authorization.';

