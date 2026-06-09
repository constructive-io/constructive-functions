-- Deploy: schemas/constructive_memberships_public/tables/org_memberships/columns/is_external/alterations/alt0000000705
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_memberships/columns/is_external/column


COMMENT ON COLUMN "constructive_memberships_public".org_memberships.is_external IS E'Whether this member is external (not a member of the parent scope). External members may have restricted permissions.';

