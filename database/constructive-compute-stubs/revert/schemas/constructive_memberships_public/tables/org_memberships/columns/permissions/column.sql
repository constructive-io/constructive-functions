-- Revert: schemas/constructive_memberships_public/tables/org_memberships/columns/permissions/column


ALTER TABLE "constructive_memberships_public".org_memberships 
  DROP COLUMN permissions RESTRICT;


