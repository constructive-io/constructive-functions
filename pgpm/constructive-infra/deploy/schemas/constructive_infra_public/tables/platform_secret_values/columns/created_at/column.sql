-- Deploy: schemas/constructive_infra_public/tables/platform_secret_values/columns/created_at/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_values/table


ALTER TABLE "constructive_infra_public".platform_secret_values
  ADD COLUMN created_at timestamptz;
