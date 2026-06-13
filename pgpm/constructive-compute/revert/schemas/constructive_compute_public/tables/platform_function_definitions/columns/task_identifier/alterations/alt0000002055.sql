-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/task_identifier/alterations/alt0000002055


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN task_identifier DROP NOT NULL;


