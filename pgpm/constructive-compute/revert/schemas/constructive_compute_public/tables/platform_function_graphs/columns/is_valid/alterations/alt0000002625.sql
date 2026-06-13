-- Revert: schemas/constructive_compute_public/tables/platform_function_graphs/columns/is_valid/alterations/alt0000002625


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  ALTER COLUMN is_valid DROP NOT NULL;


