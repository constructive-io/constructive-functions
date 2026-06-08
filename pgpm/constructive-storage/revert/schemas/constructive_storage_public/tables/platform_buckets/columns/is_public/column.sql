-- Revert: schemas/constructive_storage_public/tables/platform_buckets/columns/is_public/column


ALTER TABLE "constructive_storage_public".platform_buckets 
  DROP COLUMN is_public RESTRICT;


