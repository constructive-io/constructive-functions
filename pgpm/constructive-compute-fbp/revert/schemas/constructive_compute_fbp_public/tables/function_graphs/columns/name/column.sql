-- Revert: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/name/column


ALTER TABLE "constructive_compute_fbp_public".function_graphs 
  DROP COLUMN name RESTRICT;


