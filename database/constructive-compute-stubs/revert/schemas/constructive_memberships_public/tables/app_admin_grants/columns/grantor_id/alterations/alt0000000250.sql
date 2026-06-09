-- Revert: schemas/constructive_memberships_public/tables/app_admin_grants/columns/grantor_id/alterations/alt0000000250


ALTER TABLE "constructive_memberships_public".app_admin_grants 
  ALTER COLUMN grantor_id DROP DEFAULT;


