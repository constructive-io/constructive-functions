-- Revert: schemas/constructive_memberships_public/tables/org_permission_default_permissions/columns/entity_id/alterations/alt0000000805


ALTER TABLE "constructive_memberships_public".org_permission_default_permissions 
  ALTER COLUMN entity_id DROP NOT NULL;


