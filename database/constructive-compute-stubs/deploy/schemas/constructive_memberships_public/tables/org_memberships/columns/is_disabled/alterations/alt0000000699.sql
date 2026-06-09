-- Deploy: schemas/constructive_memberships_public/tables/org_memberships/columns/is_disabled/alterations/alt0000000699
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_memberships/columns/is_disabled/column


COMMENT ON COLUMN "constructive_memberships_public".org_memberships.is_disabled IS 'Whether this membership is temporarily disabled';

