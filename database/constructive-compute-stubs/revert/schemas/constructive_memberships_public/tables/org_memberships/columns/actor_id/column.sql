-- Revert: schemas/constructive_memberships_public/tables/org_memberships/columns/actor_id/column


ALTER TABLE "constructive_memberships_public".org_memberships 
  DROP COLUMN actor_id RESTRICT;


