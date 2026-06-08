-- Revert: schemas/constructive_fbp_public/tables/function_graphs/columns/updated_at/alterations/alt0000000086


ALTER TABLE "constructive_fbp_public".function_graphs 
  ALTER COLUMN updated_at DROP DEFAULT;


