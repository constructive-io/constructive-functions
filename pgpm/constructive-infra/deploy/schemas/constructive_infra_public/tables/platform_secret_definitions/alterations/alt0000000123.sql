-- Deploy: schemas/constructive_infra_public/tables/platform_secret_definitions/alterations/alt0000000123
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_definitions/table


ALTER TABLE "constructive_infra_public".platform_secret_definitions 
  DISABLE ROW LEVEL SECURITY;

