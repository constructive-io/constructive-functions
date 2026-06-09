-- Revert: schemas/constructive_memberships_public/tables/org_membership_settings/columns/id/alterations/alt0000000664


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  ALTER COLUMN id DROP NOT NULL;


