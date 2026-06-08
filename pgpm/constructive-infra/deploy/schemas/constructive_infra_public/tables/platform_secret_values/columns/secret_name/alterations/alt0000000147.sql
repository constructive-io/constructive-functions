-- Deploy: schemas/constructive_infra_public/tables/platform_secret_values/columns/secret_name/alterations/alt0000000147
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_values/table
-- requires: schemas/constructive_infra_public/tables/platform_secret_values/columns/secret_name/column


ALTER TABLE "constructive_infra_public".platform_secret_values
  ALTER COLUMN secret_name SET NOT NULL;
