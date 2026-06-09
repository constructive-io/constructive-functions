-- Revert: schemas/constructive_memberships_public/tables/app_owner_grants/columns/created_at/alterations/alt0000000262


ALTER TABLE "constructive_memberships_public".app_owner_grants 
  ALTER COLUMN created_at DROP DEFAULT;


