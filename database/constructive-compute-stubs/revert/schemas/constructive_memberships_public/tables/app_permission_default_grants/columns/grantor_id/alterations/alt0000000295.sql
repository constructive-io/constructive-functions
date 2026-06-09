-- Revert: schemas/constructive_memberships_public/tables/app_permission_default_grants/columns/grantor_id/alterations/alt0000000295


ALTER TABLE "constructive_memberships_public".app_permission_default_grants 
  ALTER COLUMN grantor_id DROP DEFAULT;


