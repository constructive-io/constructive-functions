-- Revert: schemas/constructive_memberships_public/tables/org_membership_settings/columns/create_child_cascade_admins/alterations/alt0000000676


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  ALTER COLUMN create_child_cascade_admins DROP NOT NULL;


