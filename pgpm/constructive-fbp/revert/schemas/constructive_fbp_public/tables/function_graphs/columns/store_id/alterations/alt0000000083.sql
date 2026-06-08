-- Revert: schemas/constructive_fbp_public/tables/function_graphs/columns/store_id/alterations/alt0000000083


ALTER TABLE "constructive_fbp_public".function_graphs 
  ALTER COLUMN store_id DROP NOT NULL;


