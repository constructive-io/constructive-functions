-- Revert: schemas/constructive_memberships_public/tables/org_admin_grants/columns/id/column


ALTER TABLE "constructive_memberships_public".org_admin_grants 
  DROP COLUMN id RESTRICT;


