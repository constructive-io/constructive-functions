-- Revert: schemas/constructive_memberships_public/tables/org_member_profiles/columns/created_at/column


ALTER TABLE "constructive_memberships_public".org_member_profiles 
  DROP COLUMN created_at RESTRICT;


