-- Deploy: schemas/constructive_infra_public/tables/platform_function_definitions/columns/created_at/alterations/alt0000000003
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/table
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/columns/created_at/column


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  ALTER COLUMN created_at SET DEFAULT now();

