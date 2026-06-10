-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/queue_name/alterations/alt0000002068


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN queue_name DROP NOT NULL;


