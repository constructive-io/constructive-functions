-- Deploy: schemas/constructive_memberships_public/tables/app_memberships/columns/granted/alterations/alt0000000239
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_memberships/columns/granted/column


COMMENT ON COLUMN "constructive_memberships_public".app_memberships.granted IS E'Bitmask of permissions directly granted to this member (not from profiles)';

