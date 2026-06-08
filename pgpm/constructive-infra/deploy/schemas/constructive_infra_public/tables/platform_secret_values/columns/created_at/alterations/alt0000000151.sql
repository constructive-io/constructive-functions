-- Deploy: schemas/constructive_infra_public/tables/platform_secret_values/columns/created_at/alterations/alt0000000151
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_values/table
-- requires: schemas/constructive_infra_public/tables/platform_secret_values/columns/created_at/column


ALTER TABLE "constructive_infra_public".platform_secret_values
  ALTER COLUMN created_at SET DEFAULT now();
