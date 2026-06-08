-- Revert: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/created_at/alterations/alt0000000128


ALTER TABLE "constructive_infra_public".platform_secret_definitions 
  ALTER COLUMN created_at DROP DEFAULT;


