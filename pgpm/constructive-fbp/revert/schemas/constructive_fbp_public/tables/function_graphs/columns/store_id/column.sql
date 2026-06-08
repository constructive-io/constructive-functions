-- Revert: schemas/constructive_fbp_public/tables/function_graphs/columns/store_id/column


ALTER TABLE "constructive_fbp_public".function_graphs 
  DROP COLUMN store_id RESTRICT;


