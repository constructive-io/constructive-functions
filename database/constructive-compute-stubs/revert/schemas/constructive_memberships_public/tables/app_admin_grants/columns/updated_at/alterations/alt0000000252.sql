-- Revert: schemas/constructive_memberships_public/tables/app_admin_grants/columns/updated_at/alterations/alt0000000252


ALTER TABLE "constructive_memberships_public".app_admin_grants 
  ALTER COLUMN updated_at DROP DEFAULT;


