-- Revert: schemas/constructive_memberships_public/tables/org_permission_default_permissions/columns/permission_id/alterations/alt0000000803


ALTER TABLE "constructive_memberships_public".org_permission_default_permissions 
  ALTER COLUMN permission_id DROP NOT NULL;


