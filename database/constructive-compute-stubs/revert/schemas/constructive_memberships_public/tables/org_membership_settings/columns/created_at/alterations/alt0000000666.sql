-- Revert: schemas/constructive_memberships_public/tables/org_membership_settings/columns/created_at/alterations/alt0000000666


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  ALTER COLUMN created_at DROP DEFAULT;


