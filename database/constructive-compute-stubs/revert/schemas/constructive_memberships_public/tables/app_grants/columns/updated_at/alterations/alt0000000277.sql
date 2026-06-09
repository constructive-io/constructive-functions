-- Revert: schemas/constructive_memberships_public/tables/app_grants/columns/updated_at/alterations/alt0000000277


ALTER TABLE "constructive_memberships_public".app_grants 
  ALTER COLUMN updated_at DROP DEFAULT;


