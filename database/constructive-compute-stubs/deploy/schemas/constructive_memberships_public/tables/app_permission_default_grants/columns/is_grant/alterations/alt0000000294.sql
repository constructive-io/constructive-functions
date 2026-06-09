-- Deploy: schemas/constructive_memberships_public/tables/app_permission_default_grants/columns/is_grant/alterations/alt0000000294
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_permission_default_grants/columns/is_grant/column


COMMENT ON COLUMN "constructive_memberships_public".app_permission_default_grants.is_grant IS E'True to add the permission to defaults, false to remove it';

