-- Revert: schemas/constructive_storage_public/tables/platform_buckets/columns/allow_custom_keys/column


ALTER TABLE "constructive_storage_public".platform_buckets 
  DROP COLUMN allow_custom_keys RESTRICT;


