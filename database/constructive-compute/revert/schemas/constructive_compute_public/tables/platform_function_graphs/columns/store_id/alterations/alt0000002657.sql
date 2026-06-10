-- Revert: schemas/constructive_compute_public/tables/platform_function_graphs/columns/store_id/alterations/alt0000002657


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  ALTER COLUMN store_id DROP NOT NULL;


