-- Revert: schemas/constructive_compute_public/tables/platform_function_graphs/columns/name/column


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  DROP COLUMN name RESTRICT;


