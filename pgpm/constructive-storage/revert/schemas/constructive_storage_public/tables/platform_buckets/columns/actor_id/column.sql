-- Revert: schemas/constructive_storage_public/tables/platform_buckets/columns/actor_id/column


ALTER TABLE "constructive_storage_public".platform_buckets 
  DROP COLUMN actor_id RESTRICT;


