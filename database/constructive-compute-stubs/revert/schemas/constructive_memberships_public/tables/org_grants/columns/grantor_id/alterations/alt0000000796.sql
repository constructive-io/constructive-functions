-- Revert: schemas/constructive_memberships_public/tables/org_grants/columns/grantor_id/alterations/alt0000000796


ALTER TABLE "constructive_memberships_public".org_grants 
  ALTER COLUMN grantor_id DROP DEFAULT;


