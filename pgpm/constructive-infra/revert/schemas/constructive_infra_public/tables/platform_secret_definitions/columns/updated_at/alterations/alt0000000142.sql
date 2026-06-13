-- Revert: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/updated_at/alterations/alt0000000142


ALTER TABLE "constructive_infra_public".platform_secret_definitions 
  ALTER COLUMN updated_at DROP DEFAULT;


