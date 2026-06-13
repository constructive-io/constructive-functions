-- Revert: schemas/constructive_infra_public/tables/platform_function_definitions/columns/updated_at/alterations/alt0000000036


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  ALTER COLUMN updated_at DROP DEFAULT;


