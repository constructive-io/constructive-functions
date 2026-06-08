-- Revert: schemas/constructive_fbp_public/tables/function_graphs/columns/is_valid/column


ALTER TABLE "constructive_fbp_public".function_graphs 
  DROP COLUMN is_valid RESTRICT;


