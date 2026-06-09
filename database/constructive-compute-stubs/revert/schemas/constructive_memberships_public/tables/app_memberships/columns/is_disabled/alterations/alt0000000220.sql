-- Revert: schemas/constructive_memberships_public/tables/app_memberships/columns/is_disabled/alterations/alt0000000220


ALTER TABLE "constructive_memberships_public".app_memberships 
  ALTER COLUMN is_disabled DROP DEFAULT;


