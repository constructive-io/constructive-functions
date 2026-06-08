-- Revert: schemas/constructive_storage_public/tables/platform_buckets/columns/actor_id/alterations/alt0000000004


ALTER TABLE "constructive_storage_public".platform_buckets 
  ALTER COLUMN actor_id DROP NOT NULL;


