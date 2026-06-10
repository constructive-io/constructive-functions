-- Revert: schemas/constructive_compute_public/tables/platform_function_invocations/columns/task_identifier/alterations/alt0000002192


ALTER TABLE "constructive_compute_public".platform_function_invocations 
  ALTER COLUMN task_identifier DROP NOT NULL;


