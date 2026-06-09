-- Revert: schemas/constructive_memberships_public/tables/org_memberships/columns/is_active/column


ALTER TABLE "constructive_memberships_public".org_memberships 
  DROP COLUMN is_active RESTRICT;


