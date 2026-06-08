-- Deploy: schemas/constructive_infra_public/tables/platform_secret_values/constraints/platform_secret_values_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_values/table
-- requires: schemas/constructive_infra_public/tables/platform_secret_values/columns/id/column


ALTER TABLE "constructive_infra_public".platform_secret_values
  ADD CONSTRAINT platform_secret_values_pkey PRIMARY KEY (id);
