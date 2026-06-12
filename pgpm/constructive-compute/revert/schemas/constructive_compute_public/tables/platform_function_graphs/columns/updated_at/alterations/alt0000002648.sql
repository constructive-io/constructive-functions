-- Revert: schemas/constructive_compute_public/tables/platform_function_graphs/columns/updated_at/alterations/alt0000002648


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  ALTER COLUMN updated_at DROP DEFAULT;


