-- Revert: schemas/constructive_storage_public/tables/platform_buckets/columns/allow_custom_keys/alterations/alt0000002468


ALTER TABLE "constructive_storage_public".platform_buckets 
  ALTER COLUMN allow_custom_keys DROP DEFAULT;


