-- Revert: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/annotations/column


ALTER TABLE "constructive_infra_public".platform_secret_definitions 
  DROP COLUMN annotations RESTRICT;


