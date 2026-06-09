-- Revert: schemas/constructive_memberships_public/tables/org_permission_default_permissions/columns/id/column


ALTER TABLE "constructive_memberships_public".org_permission_default_permissions 
  DROP COLUMN id RESTRICT;


