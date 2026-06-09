-- Revert: schemas/constructive_memberships_public/tables/app_permission_default_permissions/columns/updated_at/column


ALTER TABLE "constructive_memberships_public".app_permission_default_permissions 
  DROP COLUMN updated_at RESTRICT;


