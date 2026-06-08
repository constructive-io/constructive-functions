-- Revert: schemas/constructive_storage_public/tables/platform_buckets/columns/key/alterations/alt0000000020


ALTER TABLE "constructive_storage_public".platform_buckets 
  ALTER COLUMN key DROP NOT NULL;


