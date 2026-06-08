-- Revert: schemas/constructive_fbp_public/tables/function_graphs/columns/entity_id/column


ALTER TABLE "constructive_fbp_public".function_graphs 
  DROP COLUMN entity_id RESTRICT;


