-- Revert: schemas/constructive_compute_public/tables/platform_function_graphs/columns/name/alterations/alt0000002663


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  ALTER COLUMN name DROP NOT NULL;


