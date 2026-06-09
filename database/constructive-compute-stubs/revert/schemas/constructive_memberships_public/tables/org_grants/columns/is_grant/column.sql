-- Revert: schemas/constructive_memberships_public/tables/org_grants/columns/is_grant/column


ALTER TABLE "constructive_memberships_public".org_grants 
  DROP COLUMN is_grant RESTRICT;


