-- Deploy: schemas/constructive_memberships_public/tables/org_memberships/columns/permissions/alterations/alt0000000714
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_memberships/columns/permissions/column


COMMENT ON COLUMN "constructive_memberships_public".org_memberships.permissions IS E'Aggregated permission bitmask combining profile-based and directly granted permissions';

