-- Revert: schemas/constructive_compute_public/tables/platform_function_graphs/columns/context/alterations/alt0000002633


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  ALTER COLUMN context DROP DEFAULT;


