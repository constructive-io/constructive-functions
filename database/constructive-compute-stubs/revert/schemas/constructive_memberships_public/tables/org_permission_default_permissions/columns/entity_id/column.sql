-- Revert: schemas/constructive_memberships_public/tables/org_permission_default_permissions/columns/entity_id/column


ALTER TABLE "constructive_memberships_public".org_permission_default_permissions 
  DROP COLUMN entity_id RESTRICT;


