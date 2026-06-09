-- Revert: schemas/constructive_memberships_public/tables/org_grants/columns/permissions/alterations/alt0000000788


ALTER TABLE "constructive_memberships_public".org_grants 
  ALTER COLUMN permissions DROP DEFAULT;


