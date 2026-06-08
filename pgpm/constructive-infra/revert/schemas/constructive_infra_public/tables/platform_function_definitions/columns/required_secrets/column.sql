-- Revert: schemas/constructive_infra_public/tables/platform_function_definitions/columns/required_secrets/column


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  DROP COLUMN required_secrets RESTRICT;


