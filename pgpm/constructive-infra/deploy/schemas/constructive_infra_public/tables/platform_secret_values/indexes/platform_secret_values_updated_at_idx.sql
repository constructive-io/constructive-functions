-- Deploy: schemas/constructive_infra_public/tables/platform_secret_values/indexes/platform_secret_values_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_values/table
-- requires: schemas/constructive_infra_public/tables/platform_secret_values/columns/updated_at/column


CREATE INDEX platform_secret_values_updated_at_idx ON "constructive_infra_public".platform_secret_values ( updated_at );
