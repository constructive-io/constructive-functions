-- Revert: schemas/constructive_infra_public/tables/platform_function_definitions/columns/is_built_in/alterations/alt0000000007


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  ALTER COLUMN is_built_in DROP NOT NULL;


