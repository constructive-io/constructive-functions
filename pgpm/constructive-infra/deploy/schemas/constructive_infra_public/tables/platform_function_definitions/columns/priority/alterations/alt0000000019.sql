-- Deploy: schemas/constructive_infra_public/tables/platform_function_definitions/columns/priority/alterations/alt0000000019
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/table
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/columns/priority/column


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  ALTER COLUMN priority SET NOT NULL;

