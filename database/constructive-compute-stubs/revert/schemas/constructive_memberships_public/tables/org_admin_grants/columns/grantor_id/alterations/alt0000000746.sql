-- Revert: schemas/constructive_memberships_public/tables/org_admin_grants/columns/grantor_id/alterations/alt0000000746


ALTER TABLE "constructive_memberships_public".org_admin_grants 
  ALTER COLUMN grantor_id DROP DEFAULT;


