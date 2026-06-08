-- Revert: schemas/constructive_fbp_public/tables/function_graphs/columns/updated_at/column


ALTER TABLE "constructive_fbp_public".function_graphs 
  DROP COLUMN updated_at RESTRICT;


