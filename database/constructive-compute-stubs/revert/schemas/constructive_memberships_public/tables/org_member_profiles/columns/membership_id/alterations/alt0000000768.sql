-- Revert: schemas/constructive_memberships_public/tables/org_member_profiles/columns/membership_id/alterations/alt0000000768


ALTER TABLE "constructive_memberships_public".org_member_profiles 
  ALTER COLUMN membership_id DROP NOT NULL;


