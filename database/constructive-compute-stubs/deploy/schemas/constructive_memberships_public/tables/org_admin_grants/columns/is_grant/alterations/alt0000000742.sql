-- Deploy: schemas/constructive_memberships_public/tables/org_admin_grants/columns/is_grant/alterations/alt0000000742
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_admin_grants/columns/is_grant/column


COMMENT ON COLUMN "constructive_memberships_public".org_admin_grants.is_grant IS E'True to grant admin, false to revoke admin';

