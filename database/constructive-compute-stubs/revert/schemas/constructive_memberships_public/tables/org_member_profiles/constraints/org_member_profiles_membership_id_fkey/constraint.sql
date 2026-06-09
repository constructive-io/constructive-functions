-- Revert: schemas/constructive_memberships_public/tables/org_member_profiles/constraints/org_member_profiles_membership_id_fkey/constraint


ALTER TABLE "constructive_memberships_public".org_member_profiles 
  DROP CONSTRAINT org_member_profiles_membership_id_fkey;


