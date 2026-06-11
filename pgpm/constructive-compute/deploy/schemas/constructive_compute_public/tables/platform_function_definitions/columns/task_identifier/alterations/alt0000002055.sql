-- Deploy: schemas/constructive_compute_public/tables/platform_function_definitions/columns/task_identifier/alterations/alt0000002055
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/table
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/columns/task_identifier/column


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN task_identifier SET NOT NULL;

