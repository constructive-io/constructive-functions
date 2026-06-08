-- Deploy: schemas/constructive_infra_public/tables/platform_secret_values/columns/secret_name/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_values/table


ALTER TABLE "constructive_infra_public".platform_secret_values
  ADD COLUMN secret_name text;
