-- Revert: schemas/constructive_memberships_public/tables/org_member_profiles/constraints/org_member_profiles_actor_id_entity_id_key/constraint


ALTER TABLE "constructive_memberships_public".org_member_profiles 
  DROP CONSTRAINT org_member_profiles_actor_id_entity_id_key;


