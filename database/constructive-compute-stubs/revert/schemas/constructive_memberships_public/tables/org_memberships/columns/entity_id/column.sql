-- Revert: schemas/constructive_memberships_public/tables/org_memberships/columns/entity_id/column


ALTER TABLE "constructive_memberships_public".org_memberships 
  DROP COLUMN entity_id RESTRICT;


