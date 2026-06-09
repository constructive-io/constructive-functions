-- Revert: schemas/constructive_memberships_public/tables/org_member_profiles/columns/display_name/alterations/alt0000000774


ALTER TABLE "constructive_memberships_public".org_member_profiles 
  ALTER COLUMN display_name DROP DEFAULT;


