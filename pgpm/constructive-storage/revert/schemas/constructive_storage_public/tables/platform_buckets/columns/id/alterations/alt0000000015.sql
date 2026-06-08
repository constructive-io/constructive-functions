-- Revert: schemas/constructive_storage_public/tables/platform_buckets/columns/id/alterations/alt0000000015


ALTER TABLE "constructive_storage_public".platform_buckets 
  ALTER COLUMN id DROP NOT NULL;


