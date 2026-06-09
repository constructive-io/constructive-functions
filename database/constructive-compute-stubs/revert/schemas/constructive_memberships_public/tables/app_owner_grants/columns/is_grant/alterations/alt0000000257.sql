-- Revert: schemas/constructive_memberships_public/tables/app_owner_grants/columns/is_grant/alterations/alt0000000257


ALTER TABLE "constructive_memberships_public".app_owner_grants 
  ALTER COLUMN is_grant DROP NOT NULL;


