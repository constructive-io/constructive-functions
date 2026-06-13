-- Revert: schemas/constructive_compute_public/tables/platform_function_graphs/columns/database_id/alterations/alt0000002613


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  ALTER COLUMN database_id DROP NOT NULL;


