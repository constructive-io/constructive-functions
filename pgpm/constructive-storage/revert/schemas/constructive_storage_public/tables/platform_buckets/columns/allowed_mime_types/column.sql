-- Revert: schemas/constructive_storage_public/tables/platform_buckets/columns/allowed_mime_types/column


ALTER TABLE "constructive_storage_public".platform_buckets 
  DROP COLUMN allowed_mime_types RESTRICT;


