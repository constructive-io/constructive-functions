-- Revert: schemas/constructive_storage_public/tables/platform_buckets/columns/database_id/column


ALTER TABLE "constructive_storage_public".platform_buckets 
  DROP COLUMN database_id RESTRICT;


