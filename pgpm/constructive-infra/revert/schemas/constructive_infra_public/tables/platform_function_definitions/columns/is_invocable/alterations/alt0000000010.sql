-- Revert: schemas/constructive_infra_public/tables/platform_function_definitions/columns/is_invocable/alterations/alt0000000010


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  ALTER COLUMN is_invocable DROP NOT NULL;


