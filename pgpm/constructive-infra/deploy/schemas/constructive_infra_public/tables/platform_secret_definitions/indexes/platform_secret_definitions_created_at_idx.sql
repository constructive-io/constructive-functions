-- Deploy: schemas/constructive_infra_public/tables/platform_secret_definitions/indexes/platform_secret_definitions_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_definitions/table
-- requires: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/created_at/column


CREATE INDEX platform_secret_definitions_created_at_idx ON "constructive_infra_public".platform_secret_definitions ( created_at );

