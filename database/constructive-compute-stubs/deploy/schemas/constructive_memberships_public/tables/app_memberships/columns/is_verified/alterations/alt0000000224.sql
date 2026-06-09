-- Deploy: schemas/constructive_memberships_public/tables/app_memberships/columns/is_verified/alterations/alt0000000224
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_memberships/columns/is_verified/column


COMMENT ON COLUMN "constructive_memberships_public".app_memberships.is_verified IS E'Whether this member has been verified (e.g. email confirmation)';

