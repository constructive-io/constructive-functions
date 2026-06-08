-- Revert: schemas/constructive_storage_public/tables/platform_buckets/columns/database_id/alterations/alt0000000012


ALTER TABLE "constructive_storage_public".platform_buckets 
  ALTER COLUMN database_id DROP NOT NULL;


