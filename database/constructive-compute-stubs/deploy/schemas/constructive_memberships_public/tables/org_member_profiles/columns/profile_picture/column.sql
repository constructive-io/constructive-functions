-- Deploy: schemas/constructive_memberships_public/tables/org_member_profiles/columns/profile_picture/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_member_profiles/table


ALTER TABLE "constructive_memberships_public".org_member_profiles 
  ADD COLUMN profile_picture image;

