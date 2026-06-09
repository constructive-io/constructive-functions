-- Revert: schemas/constructive_memberships_public/tables/org_memberships/columns/granted/column


ALTER TABLE "constructive_memberships_public".org_memberships 
  DROP COLUMN granted RESTRICT;


