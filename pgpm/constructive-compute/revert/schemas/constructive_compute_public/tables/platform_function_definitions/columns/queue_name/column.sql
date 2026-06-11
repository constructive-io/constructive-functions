-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/queue_name/column


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  DROP COLUMN queue_name RESTRICT;


