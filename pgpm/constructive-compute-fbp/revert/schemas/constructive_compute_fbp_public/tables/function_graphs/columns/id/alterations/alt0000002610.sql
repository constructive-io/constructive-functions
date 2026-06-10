-- Revert: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/id/alterations/alt0000002610


ALTER TABLE "constructive_compute_fbp_public".function_graphs 
  ALTER COLUMN id DROP NOT NULL;


