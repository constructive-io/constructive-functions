-- Revert: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/database_id/alterations/alt0000002613


ALTER TABLE "constructive_compute_fbp_public".function_graphs 
  ALTER COLUMN database_id DROP NOT NULL;


