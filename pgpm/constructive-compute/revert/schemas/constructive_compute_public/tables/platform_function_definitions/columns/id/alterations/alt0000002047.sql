-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/id/alterations/alt0000002047


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN id DROP NOT NULL;


