-- Revert: schemas/constructive_compute_public/tables/platform_function_graphs/columns/is_valid/column


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  DROP COLUMN is_valid RESTRICT;


