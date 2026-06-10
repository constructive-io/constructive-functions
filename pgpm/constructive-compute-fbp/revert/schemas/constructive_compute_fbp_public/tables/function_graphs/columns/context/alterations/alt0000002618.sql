-- Revert: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/context/alterations/alt0000002618


ALTER TABLE "constructive_compute_fbp_public".function_graphs 
  ALTER COLUMN context DROP NOT NULL;


