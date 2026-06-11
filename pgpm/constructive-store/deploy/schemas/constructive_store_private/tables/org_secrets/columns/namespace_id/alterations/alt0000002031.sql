-- Deploy: schemas/constructive_store_private/tables/org_secrets/columns/namespace_id/alterations/alt0000002031
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/columns/namespace_id/column


COMMENT ON COLUMN "constructive_store_private".org_secrets.namespace_id IS E'FK to namespaces — logical grouping for secrets';

