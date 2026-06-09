-- Revert: schemas/constructive_memberships_public/tables/org_memberships/columns/id/column


ALTER TABLE "constructive_memberships_public".org_memberships 
  DROP COLUMN id RESTRICT;


