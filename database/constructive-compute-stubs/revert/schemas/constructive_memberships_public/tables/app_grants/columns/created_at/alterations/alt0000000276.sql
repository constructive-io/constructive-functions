-- Revert: schemas/constructive_memberships_public/tables/app_grants/columns/created_at/alterations/alt0000000276


ALTER TABLE "constructive_memberships_public".app_grants 
  ALTER COLUMN created_at DROP DEFAULT;


