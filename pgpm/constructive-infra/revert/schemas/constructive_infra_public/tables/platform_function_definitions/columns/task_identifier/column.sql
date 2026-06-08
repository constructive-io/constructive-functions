-- Revert: schemas/constructive_infra_public/tables/platform_function_definitions/columns/task_identifier/column


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  DROP COLUMN task_identifier RESTRICT;


