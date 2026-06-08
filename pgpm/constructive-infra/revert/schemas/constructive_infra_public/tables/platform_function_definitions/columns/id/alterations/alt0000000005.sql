-- Revert: schemas/constructive_infra_public/tables/platform_function_definitions/columns/id/alterations/alt0000000005


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  ALTER COLUMN id DROP NOT NULL;


