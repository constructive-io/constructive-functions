-- Revert: schemas/constructive_storage_public/tables/platform_buckets/columns/created_at/alterations/alt0000002449


ALTER TABLE "constructive_storage_public".platform_buckets 
  ALTER COLUMN created_at DROP DEFAULT;


