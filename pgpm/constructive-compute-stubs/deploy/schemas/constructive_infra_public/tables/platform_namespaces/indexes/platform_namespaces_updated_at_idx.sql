-- Deploy: schemas/constructive_infra_public/tables/platform_namespaces/indexes/platform_namespaces_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/table
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/columns/updated_at/column


CREATE INDEX platform_namespaces_updated_at_idx ON "constructive_infra_public".platform_namespaces ( updated_at );

