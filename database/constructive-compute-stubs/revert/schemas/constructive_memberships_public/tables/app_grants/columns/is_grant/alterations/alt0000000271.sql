-- Revert: schemas/constructive_memberships_public/tables/app_grants/columns/is_grant/alterations/alt0000000271


ALTER TABLE "constructive_memberships_public".app_grants 
  ALTER COLUMN is_grant DROP NOT NULL;


