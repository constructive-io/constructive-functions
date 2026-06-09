-- Revert: schemas/constructive_memberships_public/tables/app_memberships/columns/created_at/alterations/alt0000000185


ALTER TABLE "constructive_memberships_public".app_memberships 
  ALTER COLUMN created_at DROP DEFAULT;


