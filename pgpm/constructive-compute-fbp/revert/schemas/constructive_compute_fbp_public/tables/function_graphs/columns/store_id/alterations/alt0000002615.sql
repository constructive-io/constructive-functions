-- Revert: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/store_id/alterations/alt0000002615


ALTER TABLE "constructive_compute_fbp_public".function_graphs 
  ALTER COLUMN store_id DROP NOT NULL;


