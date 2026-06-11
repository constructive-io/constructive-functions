-- Revert: schemas/constructive_compute_public/tables/platform_function_graphs/columns/created_at/alterations/alt0000002630


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  ALTER COLUMN created_at DROP NOT NULL;


