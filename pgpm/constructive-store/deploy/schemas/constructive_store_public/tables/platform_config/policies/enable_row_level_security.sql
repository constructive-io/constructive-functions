-- Deploy: schemas/constructive_store_public/tables/platform_config/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config/table


ALTER TABLE "constructive_store_public".platform_config 
  ENABLE ROW LEVEL SECURITY;

