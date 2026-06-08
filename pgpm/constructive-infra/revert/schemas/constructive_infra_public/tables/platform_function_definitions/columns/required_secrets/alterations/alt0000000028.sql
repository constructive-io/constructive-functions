-- Revert: schemas/constructive_infra_public/tables/platform_function_definitions/columns/required_secrets/alterations/alt0000000028


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  ALTER COLUMN required_secrets DROP NOT NULL;


