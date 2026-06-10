-- Revert: schemas/constructive_compute_public/tables/platform_function_invocations/columns/id/alterations/alt0000002185


ALTER TABLE "constructive_compute_public".platform_function_invocations 
  ALTER COLUMN id DROP NOT NULL;


