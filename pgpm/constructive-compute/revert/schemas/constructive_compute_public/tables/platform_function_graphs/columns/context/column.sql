-- Revert: schemas/constructive_compute_public/tables/platform_function_graphs/columns/context/column


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  DROP COLUMN context RESTRICT;


