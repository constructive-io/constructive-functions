-- Revert: schemas/constructive_storage_public/tables/platform_buckets/columns/allowed_origins/column


ALTER TABLE "constructive_storage_public".platform_buckets 
  DROP COLUMN allowed_origins RESTRICT;


