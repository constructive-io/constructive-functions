-- Revert: schemas/constructive_memberships_public/tables/org_owner_grants/columns/id/column


ALTER TABLE "constructive_memberships_public".org_owner_grants 
  DROP COLUMN id RESTRICT;


