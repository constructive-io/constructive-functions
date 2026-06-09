-- Deploy: schemas/constructive_memberships_public/tables/app_permission_default_grants/constraints/app_permission_default_grants_permission_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_permissions_public/schema
-- requires: schemas/constructive_permissions_public/tables/app_permissions/table
-- requires: schemas/constructive_memberships_public/tables/app_permission_default_grants/table
-- requires: schemas/constructive_memberships_public/tables/app_permission_default_grants/columns/permission_id/column


ALTER TABLE "constructive_memberships_public".app_permission_default_grants 
  ADD CONSTRAINT app_permission_default_grants_permission_id_fkey 
    FOREIGN KEY(permission_id) 
    REFERENCES "constructive_permissions_public".app_permissions (id) 
    ON DELETE CASCADE;

