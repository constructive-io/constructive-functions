-- Revert: schemas/constructive_memberships_public/tables/org_grants/columns/permissions/column


ALTER TABLE "constructive_memberships_public".org_grants 
  DROP COLUMN permissions RESTRICT;


