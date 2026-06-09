-- Revert: schemas/constructive_memberships_public/tables/app_permission_default_grants/columns/updated_at/alterations/alt0000000297


ALTER TABLE "constructive_memberships_public".app_permission_default_grants 
  ALTER COLUMN updated_at DROP DEFAULT;


