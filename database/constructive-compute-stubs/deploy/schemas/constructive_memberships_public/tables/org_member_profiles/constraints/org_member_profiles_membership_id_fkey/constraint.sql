-- Deploy: schemas/constructive_memberships_public/tables/org_member_profiles/constraints/org_member_profiles_membership_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_memberships/table
-- requires: schemas/constructive_memberships_public/tables/org_member_profiles/table
-- requires: schemas/constructive_memberships_public/tables/org_member_profiles/columns/membership_id/column
-- requires: schemas/constructive_memberships_public/tables/org_memberships/columns/id/column
-- requires: schemas/constructive_memberships_public/tables/org_memberships/constraints/org_memberships_actor_id_entity_id_key/constraint
-- requires: schemas/constructive_memberships_public/tables/org_memberships/constraints/org_memberships_pkey/constraint


ALTER TABLE "constructive_memberships_public".org_member_profiles 
  ADD CONSTRAINT org_member_profiles_membership_id_fkey 
    FOREIGN KEY(membership_id) 
    REFERENCES "constructive_memberships_public".org_memberships (id) 
    ON DELETE CASCADE;

