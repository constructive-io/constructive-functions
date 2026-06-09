-- Revert: schemas/constructive_memberships_public/tables/app_memberships/columns/permissions/alterations/alt0000000235


ALTER TABLE "constructive_memberships_public".app_memberships 
  ALTER COLUMN permissions DROP DEFAULT;


