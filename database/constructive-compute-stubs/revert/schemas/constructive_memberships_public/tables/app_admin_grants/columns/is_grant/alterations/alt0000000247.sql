-- Revert: schemas/constructive_memberships_public/tables/app_admin_grants/columns/is_grant/alterations/alt0000000247


ALTER TABLE "constructive_memberships_public".app_admin_grants 
  ALTER COLUMN is_grant DROP DEFAULT;


