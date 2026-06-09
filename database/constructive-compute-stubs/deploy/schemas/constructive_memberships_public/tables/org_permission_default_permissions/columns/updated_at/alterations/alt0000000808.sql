-- Deploy: schemas/constructive_memberships_public/tables/org_permission_default_permissions/columns/updated_at/alterations/alt0000000808
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_permission_default_permissions/table
-- requires: schemas/constructive_memberships_public/tables/org_permission_default_permissions/columns/updated_at/column


ALTER TABLE "constructive_memberships_public".org_permission_default_permissions 
  ALTER COLUMN updated_at SET DEFAULT now();

