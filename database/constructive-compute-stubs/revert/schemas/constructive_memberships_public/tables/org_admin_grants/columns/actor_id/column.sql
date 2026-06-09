-- Revert: schemas/constructive_memberships_public/tables/org_admin_grants/columns/actor_id/column


ALTER TABLE "constructive_memberships_public".org_admin_grants 
  DROP COLUMN actor_id RESTRICT;


