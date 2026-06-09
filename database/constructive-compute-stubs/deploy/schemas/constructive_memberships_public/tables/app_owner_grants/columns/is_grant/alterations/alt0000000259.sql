-- Deploy: schemas/constructive_memberships_public/tables/app_owner_grants/columns/is_grant/alterations/alt0000000259
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_owner_grants/columns/is_grant/column


COMMENT ON COLUMN "constructive_memberships_public".app_owner_grants.is_grant IS E'True to grant ownership, false to revoke ownership';

