-- Revert: schemas/constructive_memberships_public/tables/app_owner_grants/columns/grantor_id/alterations/alt0000000261


ALTER TABLE "constructive_memberships_public".app_owner_grants 
  ALTER COLUMN grantor_id DROP DEFAULT;


