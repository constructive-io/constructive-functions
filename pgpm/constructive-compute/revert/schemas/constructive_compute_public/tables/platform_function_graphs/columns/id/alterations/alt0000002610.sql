-- Revert: schemas/constructive_compute_public/tables/platform_function_graphs/columns/id/alterations/alt0000002610


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  ALTER COLUMN id DROP NOT NULL;


