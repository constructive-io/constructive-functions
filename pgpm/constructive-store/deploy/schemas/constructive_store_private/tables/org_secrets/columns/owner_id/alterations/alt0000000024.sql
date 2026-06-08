-- Deploy: schemas/constructive_store_private/tables/org_secrets/columns/owner_id/alterations/alt0000000024
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/columns/owner_id/column


COMMENT ON COLUMN "constructive_store_private".org_secrets.owner_id IS E'Organization/entity that owns this secret';

