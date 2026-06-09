-- Revert: schemas/constructive_memberships_public/tables/app_memberships/columns/is_admin/alterations/alt0000000232


ALTER TABLE "constructive_memberships_public".app_memberships 
  ALTER COLUMN is_admin DROP DEFAULT;


