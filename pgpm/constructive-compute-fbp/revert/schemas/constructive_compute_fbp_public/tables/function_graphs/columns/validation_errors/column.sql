-- Revert: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/validation_errors/column


ALTER TABLE "constructive_compute_fbp_public".function_graphs 
  DROP COLUMN validation_errors RESTRICT;


