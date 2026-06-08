-- Revert: schemas/constructive_storage_public/tables/platform_buckets/columns/updated_at/alterations/alt0000000026


ALTER TABLE "constructive_storage_public".platform_buckets 
  ALTER COLUMN updated_at DROP DEFAULT;


