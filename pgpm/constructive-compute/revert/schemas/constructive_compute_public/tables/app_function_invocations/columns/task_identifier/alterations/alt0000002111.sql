-- Revert: schemas/constructive_compute_public/tables/app_function_invocations/columns/task_identifier/alterations/alt0000002111


ALTER TABLE "constructive_compute_public".app_function_invocations 
  ALTER COLUMN task_identifier DROP NOT NULL;


