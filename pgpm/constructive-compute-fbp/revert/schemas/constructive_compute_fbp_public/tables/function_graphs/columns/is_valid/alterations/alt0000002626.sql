-- Revert: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/is_valid/alterations/alt0000002626


ALTER TABLE "constructive_compute_fbp_public".function_graphs 
  ALTER COLUMN is_valid DROP DEFAULT;


