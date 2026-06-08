-- Revert: schemas/constructive_fbp_public/tables/function_graphs/columns/description/column


ALTER TABLE "constructive_fbp_public".function_graphs 
  DROP COLUMN description RESTRICT;


