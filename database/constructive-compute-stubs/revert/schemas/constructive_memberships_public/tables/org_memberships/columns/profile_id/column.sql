-- Revert: schemas/constructive_memberships_public/tables/org_memberships/columns/profile_id/column


ALTER TABLE "constructive_memberships_public".org_memberships 
  DROP COLUMN profile_id RESTRICT;


