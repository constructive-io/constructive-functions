-- Deploy: schemas/constructive_memberships_public/tables/org_permission_default_grants/columns/permission_id/alterations/alt0000000814
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_permission_default_grants/columns/permission_id/column


COMMENT ON COLUMN "constructive_memberships_public".org_permission_default_grants.permission_id IS 'References the permission being added to or removed from defaults';

