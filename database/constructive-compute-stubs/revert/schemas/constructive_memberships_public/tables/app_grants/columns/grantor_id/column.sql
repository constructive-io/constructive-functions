-- Revert: schemas/constructive_memberships_public/tables/app_grants/columns/grantor_id/column


ALTER TABLE "constructive_memberships_public".app_grants 
  DROP COLUMN grantor_id RESTRICT;


