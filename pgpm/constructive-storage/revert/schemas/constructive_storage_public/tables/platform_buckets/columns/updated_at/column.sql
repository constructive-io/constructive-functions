-- Revert: schemas/constructive_storage_public/tables/platform_buckets/columns/updated_at/column


ALTER TABLE "constructive_storage_public".platform_buckets 
  DROP COLUMN updated_at RESTRICT;


