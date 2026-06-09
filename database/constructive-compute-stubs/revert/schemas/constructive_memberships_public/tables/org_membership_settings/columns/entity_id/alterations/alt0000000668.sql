-- Revert: schemas/constructive_memberships_public/tables/org_membership_settings/columns/entity_id/alterations/alt0000000668


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  ALTER COLUMN entity_id DROP NOT NULL;


