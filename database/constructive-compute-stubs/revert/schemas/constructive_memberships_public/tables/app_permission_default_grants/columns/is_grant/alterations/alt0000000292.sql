-- Revert: schemas/constructive_memberships_public/tables/app_permission_default_grants/columns/is_grant/alterations/alt0000000292


ALTER TABLE "constructive_memberships_public".app_permission_default_grants 
  ALTER COLUMN is_grant DROP NOT NULL;


