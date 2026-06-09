-- Revert: schemas/constructive_memberships_public/tables/org_member_profiles/columns/updated_at/column


ALTER TABLE "constructive_memberships_public".org_member_profiles 
  DROP COLUMN updated_at RESTRICT;


