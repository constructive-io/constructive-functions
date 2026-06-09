-- Revert: schemas/constructive_memberships_public/tables/org_owner_grants/columns/grantor_id/alterations/alt0000000759


ALTER TABLE "constructive_memberships_public".org_owner_grants 
  ALTER COLUMN grantor_id DROP DEFAULT;


