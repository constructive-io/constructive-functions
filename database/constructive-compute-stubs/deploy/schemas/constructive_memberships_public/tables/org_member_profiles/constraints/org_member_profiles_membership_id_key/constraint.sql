-- Deploy: schemas/constructive_memberships_public/tables/org_member_profiles/constraints/org_member_profiles_membership_id_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_member_profiles/table
-- requires: schemas/constructive_memberships_public/tables/org_member_profiles/columns/membership_id/column


ALTER TABLE "constructive_memberships_public".org_member_profiles 
  ADD CONSTRAINT org_member_profiles_membership_id_key 
    UNIQUE (membership_id);

