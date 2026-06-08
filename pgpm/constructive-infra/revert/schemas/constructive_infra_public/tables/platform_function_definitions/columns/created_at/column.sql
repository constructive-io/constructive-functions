-- Revert: schemas/constructive_infra_public/tables/platform_function_definitions/columns/created_at/column


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  DROP COLUMN created_at RESTRICT;


