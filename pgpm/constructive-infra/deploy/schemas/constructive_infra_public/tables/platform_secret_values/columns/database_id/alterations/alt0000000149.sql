-- Deploy: schemas/constructive_infra_public/tables/platform_secret_values/columns/database_id/alterations/alt0000000149
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_values/table
-- requires: schemas/constructive_infra_public/tables/platform_secret_values/columns/database_id/column


ALTER TABLE "constructive_infra_public".platform_secret_values
  ALTER COLUMN database_id SET NOT NULL;
