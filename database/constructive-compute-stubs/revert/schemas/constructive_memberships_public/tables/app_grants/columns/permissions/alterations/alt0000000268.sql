-- Revert: schemas/constructive_memberships_public/tables/app_grants/columns/permissions/alterations/alt0000000268


ALTER TABLE "constructive_memberships_public".app_grants 
  ALTER COLUMN permissions DROP NOT NULL;


