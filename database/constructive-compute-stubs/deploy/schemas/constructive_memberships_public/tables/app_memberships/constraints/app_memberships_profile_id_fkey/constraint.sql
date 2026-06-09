-- Deploy: schemas/constructive_memberships_public/tables/app_memberships/constraints/app_memberships_profile_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_profiles_public/schema
-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_profiles_public/tables/app_profiles/table
-- requires: schemas/constructive_memberships_public/tables/app_memberships/table
-- requires: schemas/constructive_memberships_public/tables/app_memberships/columns/profile_id/column


ALTER TABLE "constructive_memberships_public".app_memberships 
  ADD CONSTRAINT app_memberships_profile_id_fkey 
    FOREIGN KEY(profile_id) 
    REFERENCES "constructive_profiles_public".app_profiles (id) 
    ON DELETE SET NULL;

