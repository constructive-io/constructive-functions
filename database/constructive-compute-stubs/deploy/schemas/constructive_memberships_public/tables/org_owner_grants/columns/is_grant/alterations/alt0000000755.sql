-- Deploy: schemas/constructive_memberships_public/tables/org_owner_grants/columns/is_grant/alterations/alt0000000755
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_owner_grants/columns/is_grant/column


COMMENT ON COLUMN "constructive_memberships_public".org_owner_grants.is_grant IS E'True to grant ownership, false to revoke ownership';

