-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/columns/actor_id/alterations/alt0000000005
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/columns/actor_id/column


COMMENT ON COLUMN "constructive_storage_public".platform_buckets.actor_id IS E'User who created this bucket. Forced to current_user_id() on INSERT.';

