-- Deploy: schemas/constructive_memberships_public/tables/app_permission_default_permissions/columns/updated_at/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_permission_default_permissions/table


ALTER TABLE "constructive_memberships_public".app_permission_default_permissions 
  ADD COLUMN updated_at timestamptz;

