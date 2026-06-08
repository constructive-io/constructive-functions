-- Revert: schemas/constructive_infra_public/tables/platform_function_definitions/columns/priority/column


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  DROP COLUMN priority RESTRICT;


