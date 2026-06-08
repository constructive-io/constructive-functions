-- Revert: schemas/constructive_storage_public/tables/platform_buckets/columns/is_public/alterations/alt0000000018


ALTER TABLE "constructive_storage_public".platform_buckets 
  ALTER COLUMN is_public DROP DEFAULT;


