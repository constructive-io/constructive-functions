-- Revert: schemas/constructive_memberships_public/tables/app_permission_default_grants/columns/created_at/alterations/alt0000000296


ALTER TABLE "constructive_memberships_public".app_permission_default_grants 
  ALTER COLUMN created_at DROP DEFAULT;


