-- Revert: schemas/constructive_memberships_public/tables/app_permission_default_permissions/columns/updated_at/alterations/alt0000000285


ALTER TABLE "constructive_memberships_public".app_permission_default_permissions 
  ALTER COLUMN updated_at DROP DEFAULT;


