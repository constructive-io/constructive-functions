-- Revert: schemas/constructive_storage_public/tables/platform_buckets/columns/description/column


ALTER TABLE "constructive_storage_public".platform_buckets 
  DROP COLUMN description RESTRICT;


