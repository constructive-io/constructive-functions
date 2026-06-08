-- Deploy: schemas/constructive_infra_public/tables/platform_secret_values/columns/updated_at/alterations/alt0000000152
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_values/table
-- requires: schemas/constructive_infra_public/tables/platform_secret_values/columns/updated_at/column


ALTER TABLE "constructive_infra_public".platform_secret_values
  ALTER COLUMN updated_at SET DEFAULT now();
