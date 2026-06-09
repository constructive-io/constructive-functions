-- Revert: schemas/constructive_memberships_public/tables/app_permission_default_permissions/columns/permission_id/alterations/alt0000000282


ALTER TABLE "constructive_memberships_public".app_permission_default_permissions 
  ALTER COLUMN permission_id DROP NOT NULL;


