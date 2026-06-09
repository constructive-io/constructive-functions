-- Revert: schemas/constructive_memberships_public/tables/org_membership_settings/columns/updated_at/alterations/alt0000000667


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  ALTER COLUMN updated_at DROP DEFAULT;


