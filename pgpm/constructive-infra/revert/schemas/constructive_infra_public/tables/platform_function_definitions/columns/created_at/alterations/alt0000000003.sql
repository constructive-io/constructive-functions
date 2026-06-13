-- Revert: schemas/constructive_infra_public/tables/platform_function_definitions/columns/created_at/alterations/alt0000000003


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  ALTER COLUMN created_at DROP DEFAULT;


