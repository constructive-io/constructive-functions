-- Revert: schemas/constructive_compute_public/tables/platform_function_graphs/columns/validation_errors/column


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  DROP COLUMN validation_errors RESTRICT;


