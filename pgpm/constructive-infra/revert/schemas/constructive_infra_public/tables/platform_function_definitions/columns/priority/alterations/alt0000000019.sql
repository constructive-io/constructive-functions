-- Revert: schemas/constructive_infra_public/tables/platform_function_definitions/columns/priority/alterations/alt0000000019


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  ALTER COLUMN priority DROP NOT NULL;


