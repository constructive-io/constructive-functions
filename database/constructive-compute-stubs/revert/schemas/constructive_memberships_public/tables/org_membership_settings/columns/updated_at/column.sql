-- Revert: schemas/constructive_memberships_public/tables/org_membership_settings/columns/updated_at/column


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  DROP COLUMN updated_at RESTRICT;


