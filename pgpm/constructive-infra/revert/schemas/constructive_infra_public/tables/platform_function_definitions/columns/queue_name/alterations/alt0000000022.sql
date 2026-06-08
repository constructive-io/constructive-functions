-- Revert: schemas/constructive_infra_public/tables/platform_function_definitions/columns/queue_name/alterations/alt0000000022


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  ALTER COLUMN queue_name DROP NOT NULL;


