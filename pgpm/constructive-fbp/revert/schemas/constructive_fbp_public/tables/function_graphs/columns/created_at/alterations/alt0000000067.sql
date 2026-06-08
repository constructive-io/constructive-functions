-- Revert: schemas/constructive_fbp_public/tables/function_graphs/columns/created_at/alterations/alt0000000067


ALTER TABLE "constructive_fbp_public".function_graphs 
  ALTER COLUMN created_at DROP DEFAULT;


