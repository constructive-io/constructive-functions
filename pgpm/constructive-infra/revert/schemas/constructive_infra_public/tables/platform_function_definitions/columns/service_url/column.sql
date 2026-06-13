-- Revert: schemas/constructive_infra_public/tables/platform_function_definitions/columns/service_url/column


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  DROP COLUMN service_url RESTRICT;


