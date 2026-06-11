-- Revert: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/name/alterations/alt0000002621


ALTER TABLE "constructive_compute_fbp_public".function_graphs 
  ALTER COLUMN name DROP NOT NULL;


