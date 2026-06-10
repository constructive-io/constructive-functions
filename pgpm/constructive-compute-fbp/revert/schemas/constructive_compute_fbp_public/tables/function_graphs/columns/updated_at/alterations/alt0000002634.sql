-- Revert: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/updated_at/alterations/alt0000002634


ALTER TABLE "constructive_compute_fbp_public".function_graphs 
  ALTER COLUMN updated_at DROP DEFAULT;


