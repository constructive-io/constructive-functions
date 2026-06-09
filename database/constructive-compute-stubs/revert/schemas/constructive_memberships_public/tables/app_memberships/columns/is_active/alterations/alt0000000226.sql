-- Revert: schemas/constructive_memberships_public/tables/app_memberships/columns/is_active/alterations/alt0000000226


ALTER TABLE "constructive_memberships_public".app_memberships 
  ALTER COLUMN is_active DROP DEFAULT;


