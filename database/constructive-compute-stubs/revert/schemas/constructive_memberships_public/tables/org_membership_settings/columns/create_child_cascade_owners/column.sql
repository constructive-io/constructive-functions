-- Revert: schemas/constructive_memberships_public/tables/org_membership_settings/columns/create_child_cascade_owners/column


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  DROP COLUMN create_child_cascade_owners RESTRICT;


