-- Revert: schemas/constructive_fbp_public/tables/function_graphs/columns/validation_errors/column


ALTER TABLE "constructive_fbp_public".function_graphs 
  DROP COLUMN validation_errors RESTRICT;


