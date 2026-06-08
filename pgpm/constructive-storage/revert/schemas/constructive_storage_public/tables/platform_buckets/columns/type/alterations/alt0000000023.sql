-- Revert: schemas/constructive_storage_public/tables/platform_buckets/columns/type/alterations/alt0000000023


ALTER TABLE "constructive_storage_public".platform_buckets 
  ALTER COLUMN type DROP NOT NULL;


