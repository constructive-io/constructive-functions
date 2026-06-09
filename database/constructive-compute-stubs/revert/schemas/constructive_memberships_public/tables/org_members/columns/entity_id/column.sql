-- Revert: schemas/constructive_memberships_public/tables/org_members/columns/entity_id/column


ALTER TABLE "constructive_memberships_public".org_members 
  DROP COLUMN entity_id RESTRICT;


