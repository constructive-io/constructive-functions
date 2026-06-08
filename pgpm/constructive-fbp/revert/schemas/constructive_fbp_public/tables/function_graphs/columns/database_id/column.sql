-- Revert: schemas/constructive_fbp_public/tables/function_graphs/columns/database_id/column


ALTER TABLE "constructive_fbp_public".function_graphs 
  DROP COLUMN database_id RESTRICT;


