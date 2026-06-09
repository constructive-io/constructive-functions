-- Revert: schemas/constructive_memberships_public/tables/org_member_profiles/columns/actor_id/column


ALTER TABLE "constructive_memberships_public".org_member_profiles 
  DROP COLUMN actor_id RESTRICT;


