-- Revert: schemas/constructive_memberships_public/tables/org_permission_default_grants/columns/grantor_id/alterations/alt0000000818


ALTER TABLE "constructive_memberships_public".org_permission_default_grants 
  ALTER COLUMN grantor_id DROP DEFAULT;


