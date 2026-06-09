-- Revert: schemas/constructive_memberships_public/tables/org_members/constraints/org_members_actor_id_fkey/constraint


ALTER TABLE "constructive_memberships_public".org_members 
  DROP CONSTRAINT org_members_actor_id_fkey;


