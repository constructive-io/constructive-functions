-- Revert: schemas/constructive_fbp_public/tables/function_graphs/columns/id/column


ALTER TABLE "constructive_fbp_public".function_graphs 
  DROP COLUMN id RESTRICT;


