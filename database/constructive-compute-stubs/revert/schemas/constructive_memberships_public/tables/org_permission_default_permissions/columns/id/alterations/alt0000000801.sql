-- Revert: schemas/constructive_memberships_public/tables/org_permission_default_permissions/columns/id/alterations/alt0000000801


ALTER TABLE "constructive_memberships_public".org_permission_default_permissions 
  ALTER COLUMN id DROP NOT NULL;


