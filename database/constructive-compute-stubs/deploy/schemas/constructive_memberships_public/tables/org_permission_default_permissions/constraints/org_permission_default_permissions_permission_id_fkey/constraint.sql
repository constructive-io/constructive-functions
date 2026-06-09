-- Deploy: schemas/constructive_memberships_public/tables/org_permission_default_permissions/constraints/org_permission_default_permissions_permission_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_permissions_public/schema
-- requires: schemas/constructive_permissions_public/tables/org_permissions/table
-- requires: schemas/constructive_memberships_public/tables/org_permission_default_permissions/table
-- requires: schemas/constructive_memberships_public/tables/org_permission_default_permissions/columns/permission_id/column


ALTER TABLE "constructive_memberships_public".org_permission_default_permissions 
  ADD CONSTRAINT org_permission_default_permissions_permission_id_fkey 
    FOREIGN KEY(permission_id) 
    REFERENCES "constructive_permissions_public".org_permissions (id) 
    ON DELETE CASCADE;

