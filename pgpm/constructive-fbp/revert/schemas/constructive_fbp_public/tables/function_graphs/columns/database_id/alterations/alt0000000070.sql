-- Revert: schemas/constructive_fbp_public/tables/function_graphs/columns/database_id/alterations/alt0000000070


ALTER TABLE "constructive_fbp_public".function_graphs 
  ALTER COLUMN database_id DROP NOT NULL;


