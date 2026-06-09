-- Revert: schemas/constructive_memberships_public/tables/org_memberships/columns/updated_by/column


ALTER TABLE "constructive_memberships_public".org_memberships 
  DROP COLUMN updated_by RESTRICT;


