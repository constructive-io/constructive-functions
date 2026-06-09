-- Revert: schemas/constructive_memberships_public/tables/org_grants/columns/is_grant/alterations/alt0000000791


ALTER TABLE "constructive_memberships_public".org_grants 
  ALTER COLUMN is_grant DROP DEFAULT;


