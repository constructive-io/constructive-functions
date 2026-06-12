-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/volatile/alterations/alt0000002090


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN volatile DROP NOT NULL;


