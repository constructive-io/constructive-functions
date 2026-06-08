-- Revert: schemas/constructive_fbp_public/tables/function_graphs/columns/name/alterations/alt0000000081


ALTER TABLE "constructive_fbp_public".function_graphs 
  ALTER COLUMN name DROP NOT NULL;


