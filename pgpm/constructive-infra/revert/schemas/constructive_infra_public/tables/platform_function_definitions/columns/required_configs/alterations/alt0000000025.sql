-- Revert: schemas/constructive_infra_public/tables/platform_function_definitions/columns/required_configs/alterations/alt0000000025


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  ALTER COLUMN required_configs DROP NOT NULL;


