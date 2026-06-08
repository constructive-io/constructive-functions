-- Revert: schemas/constructive_infra_public/tables/platform_function_definitions/columns/max_attempts/alterations/alt0000000013


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  ALTER COLUMN max_attempts DROP NOT NULL;


