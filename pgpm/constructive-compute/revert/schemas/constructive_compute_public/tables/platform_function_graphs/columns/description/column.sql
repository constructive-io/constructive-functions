-- Revert: schemas/constructive_compute_public/tables/platform_function_graphs/columns/description/column


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  DROP COLUMN description RESTRICT;


