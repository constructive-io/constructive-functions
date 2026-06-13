-- Revert: schemas/constructive_infra_public/tables/platform_function_definitions/columns/name/alterations/alt0000000016


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  ALTER COLUMN name DROP NOT NULL;


