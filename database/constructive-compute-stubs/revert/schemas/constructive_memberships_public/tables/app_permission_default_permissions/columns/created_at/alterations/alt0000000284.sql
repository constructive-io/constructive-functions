-- Revert: schemas/constructive_memberships_public/tables/app_permission_default_permissions/columns/created_at/alterations/alt0000000284


ALTER TABLE "constructive_memberships_public".app_permission_default_permissions 
  ALTER COLUMN created_at DROP DEFAULT;


