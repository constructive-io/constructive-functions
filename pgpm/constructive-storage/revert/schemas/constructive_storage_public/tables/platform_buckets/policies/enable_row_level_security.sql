-- Revert: schemas/constructive_storage_public/tables/platform_buckets/policies/enable_row_level_security


ALTER TABLE "constructive_storage_public".platform_buckets 
  DISABLE ROW LEVEL SECURITY;


