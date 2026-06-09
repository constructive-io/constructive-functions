-- Revert: schemas/constructive_memberships_public/tables/app_grants/columns/grantor_id/alterations/alt0000000275


ALTER TABLE "constructive_memberships_public".app_grants 
  ALTER COLUMN grantor_id DROP DEFAULT;


