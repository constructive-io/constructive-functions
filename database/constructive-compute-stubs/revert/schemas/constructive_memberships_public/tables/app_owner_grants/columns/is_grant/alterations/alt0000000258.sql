-- Revert: schemas/constructive_memberships_public/tables/app_owner_grants/columns/is_grant/alterations/alt0000000258


ALTER TABLE "constructive_memberships_public".app_owner_grants 
  ALTER COLUMN is_grant DROP DEFAULT;


