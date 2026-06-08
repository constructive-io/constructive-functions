-- Revert: schemas/constructive_storage_public/tables/platform_buckets/columns/created_at/column


ALTER TABLE "constructive_storage_public".platform_buckets 
  DROP COLUMN created_at RESTRICT;


