-- Revert: schemas/constructive_memberships_public/tables/org_memberships/columns/is_banned/column


ALTER TABLE "constructive_memberships_public".org_memberships 
  DROP COLUMN is_banned RESTRICT;


