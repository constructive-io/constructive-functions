-- Revert: schemas/constructive_compute_public/tables/platform_function_graphs/columns/database_id/column


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  DROP COLUMN database_id RESTRICT;


