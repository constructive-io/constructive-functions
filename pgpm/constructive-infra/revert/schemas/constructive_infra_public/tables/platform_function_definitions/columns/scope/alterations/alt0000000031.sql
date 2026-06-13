-- Revert: schemas/constructive_infra_public/tables/platform_function_definitions/columns/scope/alterations/alt0000000031


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  ALTER COLUMN scope DROP NOT NULL;


