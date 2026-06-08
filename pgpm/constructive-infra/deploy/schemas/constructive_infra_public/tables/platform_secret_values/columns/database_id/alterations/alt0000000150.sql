-- Deploy: schemas/constructive_infra_public/tables/platform_secret_values/columns/database_id/alterations/alt0000000150
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_values/columns/database_id/column


COMMENT ON COLUMN "constructive_infra_public".platform_secret_values.database_id IS 'Scoped to a specific database context.';
