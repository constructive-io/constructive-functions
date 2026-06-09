-- Revert: schemas/constructive_memberships_public/tables/org_memberships/columns/created_at/column


ALTER TABLE "constructive_memberships_public".org_memberships 
  DROP COLUMN created_at RESTRICT;


