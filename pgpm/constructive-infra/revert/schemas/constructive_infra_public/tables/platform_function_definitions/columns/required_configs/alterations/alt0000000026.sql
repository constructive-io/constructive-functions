-- Revert: schemas/constructive_infra_public/tables/platform_function_definitions/columns/required_configs/alterations/alt0000000026


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  ALTER COLUMN required_configs DROP DEFAULT;


