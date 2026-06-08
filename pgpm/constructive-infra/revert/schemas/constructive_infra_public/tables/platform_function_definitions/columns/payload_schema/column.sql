-- Revert: schemas/constructive_infra_public/tables/platform_function_definitions/columns/payload_schema/column


ALTER TABLE "constructive_infra_public".platform_function_definitions
  DROP COLUMN payload_schema RESTRICT;
