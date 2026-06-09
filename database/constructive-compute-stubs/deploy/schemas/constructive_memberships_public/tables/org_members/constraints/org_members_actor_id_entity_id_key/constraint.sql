-- Deploy: schemas/constructive_memberships_public/tables/org_members/constraints/org_members_actor_id_entity_id_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_members/table
-- requires: schemas/constructive_memberships_public/tables/org_members/columns/actor_id/column
-- requires: schemas/constructive_memberships_public/tables/org_members/columns/entity_id/column


ALTER TABLE "constructive_memberships_public".org_members 
  ADD CONSTRAINT org_members_actor_id_entity_id_key 
    UNIQUE (actor_id, entity_id);

