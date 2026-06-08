-- Revert: schemas/constructive_fbp_public/tables/function_graphs/columns/is_valid/alterations/alt0000000078


ALTER TABLE "constructive_fbp_public".function_graphs 
  ALTER COLUMN is_valid DROP NOT NULL;


