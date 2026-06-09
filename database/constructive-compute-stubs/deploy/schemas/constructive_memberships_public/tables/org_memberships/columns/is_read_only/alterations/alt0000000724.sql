-- Deploy: schemas/constructive_memberships_public/tables/org_memberships/columns/is_read_only/alterations/alt0000000724
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_memberships/columns/is_read_only/column


COMMENT ON COLUMN "constructive_memberships_public".org_memberships.is_read_only IS E'Whether this member has read-only access (blocks mutations when true)';

