-- Revert: schemas/constructive_fbp_public/tables/function_graphs/columns/context/alterations/alt0000000063


ALTER TABLE "constructive_fbp_public".function_graphs 
  ALTER COLUMN context DROP NOT NULL;


