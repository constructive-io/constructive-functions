-- Revert: schemas/constructive_storage_public/tables/platform_buckets/constraints/platform_buckets_database_id_key_key/constraint


ALTER TABLE "constructive_storage_public".platform_buckets 
  DROP CONSTRAINT platform_buckets_database_id_key_key;


