-- Revert: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/context/column


ALTER TABLE "constructive_compute_fbp_public".function_graphs 
  DROP COLUMN context RESTRICT;


