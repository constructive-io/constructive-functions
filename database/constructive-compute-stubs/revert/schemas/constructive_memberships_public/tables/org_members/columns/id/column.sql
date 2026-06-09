-- Revert: schemas/constructive_memberships_public/tables/org_members/columns/id/column


ALTER TABLE "constructive_memberships_public".org_members 
  DROP COLUMN id RESTRICT;


