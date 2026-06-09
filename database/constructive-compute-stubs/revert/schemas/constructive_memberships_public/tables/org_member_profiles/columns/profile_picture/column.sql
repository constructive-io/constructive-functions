-- Revert: schemas/constructive_memberships_public/tables/org_member_profiles/columns/profile_picture/column


ALTER TABLE "constructive_memberships_public".org_member_profiles 
  DROP COLUMN profile_picture RESTRICT;


