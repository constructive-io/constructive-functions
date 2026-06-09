-- Deploy: schemas/constructive_memberships_public/tables/app_permission_default_permissions/columns/permission_id/alterations/alt0000000283
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_permission_default_permissions/columns/permission_id/column


COMMENT ON COLUMN "constructive_memberships_public".app_permission_default_permissions.permission_id IS 'References the permission included in the defaults bundle';

