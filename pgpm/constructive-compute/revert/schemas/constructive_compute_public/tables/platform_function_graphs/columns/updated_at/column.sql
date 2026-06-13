-- Revert: schemas/constructive_compute_public/tables/platform_function_graphs/columns/updated_at/column


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  DROP COLUMN updated_at RESTRICT;


