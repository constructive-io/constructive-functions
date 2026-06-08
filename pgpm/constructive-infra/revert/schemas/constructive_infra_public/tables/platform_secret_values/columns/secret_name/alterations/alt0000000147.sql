-- Revert: schemas/constructive_infra_public/tables/platform_secret_values/columns/secret_name/alterations/alt0000000147


ALTER TABLE "constructive_infra_public".platform_secret_values
  ALTER COLUMN secret_name DROP NOT NULL;
