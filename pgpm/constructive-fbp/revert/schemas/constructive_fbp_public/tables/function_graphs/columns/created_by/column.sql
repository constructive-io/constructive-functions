-- Revert: schemas/constructive_fbp_public/tables/function_graphs/columns/created_by/column


ALTER TABLE "constructive_fbp_public".function_graphs 
  DROP COLUMN created_by RESTRICT;


