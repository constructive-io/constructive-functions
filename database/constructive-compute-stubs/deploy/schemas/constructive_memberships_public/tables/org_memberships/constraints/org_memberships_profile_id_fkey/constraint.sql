-- Deploy: schemas/constructive_memberships_public/tables/org_memberships/constraints/org_memberships_profile_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_profiles_public/schema
-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_profiles_public/tables/org_profiles/table
-- requires: schemas/constructive_memberships_public/tables/org_memberships/table
-- requires: schemas/constructive_memberships_public/tables/org_memberships/columns/profile_id/column


ALTER TABLE "constructive_memberships_public".org_memberships 
  ADD CONSTRAINT org_memberships_profile_id_fkey 
    FOREIGN KEY(profile_id) 
    REFERENCES "constructive_profiles_public".org_profiles (id) 
    ON DELETE SET NULL;

