-- Revert: schemas/constructive_memberships_public/tables/app_permission_default_permissions/columns/created_at/column


ALTER TABLE "constructive_memberships_public".app_permission_default_permissions 
  DROP COLUMN created_at RESTRICT;


