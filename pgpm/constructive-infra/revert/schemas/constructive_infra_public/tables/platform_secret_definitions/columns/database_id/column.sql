-- Revert: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/database_id/column


ALTER TABLE "constructive_infra_public".platform_secret_definitions 
  DROP COLUMN database_id RESTRICT;


