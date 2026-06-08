-- Revert: schemas/constructive_storage_public/tables/platform_buckets/columns/max_file_size/column


ALTER TABLE "constructive_storage_public".platform_buckets 
  DROP COLUMN max_file_size RESTRICT;


