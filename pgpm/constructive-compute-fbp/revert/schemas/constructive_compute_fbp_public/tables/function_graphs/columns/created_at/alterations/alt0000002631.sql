-- Revert: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/created_at/alterations/alt0000002631


ALTER TABLE "constructive_compute_fbp_public".function_graphs 
  ALTER COLUMN created_at DROP DEFAULT;


